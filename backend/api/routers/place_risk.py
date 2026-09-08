"""Address geocoding and explainable nearby-zone risk lookup."""
from __future__ import annotations

import logging
from math import asin, cos, radians, sin, sqrt

import httpx
from fastapi import APIRouter, HTTPException, Query

from backend.api.config import settings
from backend.api.integrations.base import AreaOfInterest
from backend.api.integrations.open_meteo import OpenMeteoAdapter
from backend.api.services.database import get_database_service
from backend.api.services.ingestion import IngestionService

router = APIRouter()
logger = logging.getLogger(__name__)


def _distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    dlat = radians(lat2 - lat1)
    dlng = radians(lng2 - lng1)
    value = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
    return 6371 * 2 * asin(sqrt(value))


@router.get("/place-risk")
async def place_risk(
    address: str = Query(min_length=3, max_length=240),
    refresh_weather: bool = Query(default=False),
):
    """Geocode a place and explain risk from the nearest monitored NER zone."""
    headers = {
        "User-Agent": "BhuRakshak/1.1 (landslide decision-support; contact=local-operator)",
        "Accept-Language": "en",
    }
    params = {"q": address, "format": "jsonv2", "limit": 1, "countrycodes": "in", "addressdetails": 1}
    geocoding_url = f"{settings.geocoding_base_url.rstrip('/')}/search"
    results = None
    last_error: Exception | None = None
    for attempt in range(2):
        try:
            timeout = httpx.Timeout(15.0, connect=5.0)
            async with httpx.AsyncClient(timeout=timeout, headers=headers, follow_redirects=True) as client:
                response = await client.get(geocoding_url, params=params)
                response.raise_for_status()
                payload = response.json()
                if not isinstance(payload, list):
                    raise ValueError("Unexpected geocoding response")
                results = payload
                break
        except (httpx.HTTPError, ValueError, TypeError) as exc:
            last_error = exc
            if attempt == 1:
                logger.warning("Place geocoding failed for %r: %s", address, exc)
    if results is None:
        raise HTTPException(
            status_code=503,
            detail="Place search provider is temporarily unavailable. Please try again shortly.",
        ) from last_error
    if not results:
        raise HTTPException(status_code=404, detail="Place not found in India. Add a district or state and try again.")

    try:
        latitude = float(results[0]["lat"])
        longitude = float(results[0]["lon"])
        display_name = str(results[0]["display_name"])
    except (KeyError, TypeError, ValueError) as exc:
        raise HTTPException(status_code=503, detail="Place search returned an invalid location") from exc
    database = get_database_service()
    zones = await database.get_all_zones()
    historical_events = await database.find_nearby_landslide_events(latitude, longitude, radius_km=100)
    historical_context = {
        "status": "events_found" if historical_events else "none_in_current_catalogue",
        "search_radius_km": 100,
        "total_nearby": len(historical_events),
        "nearest_event": historical_events[0] if historical_events else None,
        "events": historical_events,
        "disclaimer": (
            "Nearby records are historical context, not proof of current instability."
            if historical_events
            else "No nearby event appears in the current database; this does not prove that no landslide has occurred."
        ),
    }
    nearest = None
    distance = None
    for zone in zones:
        geometry = zone.get("geometry") or {}
        if geometry.get("lat") is None or geometry.get("lng") is None:
            continue
        candidate = _distance_km(latitude, longitude, geometry["lat"], geometry["lng"])
        if distance is None or candidate < distance:
            nearest, distance = zone, candidate

    weather_result = None
    weather_error = None
    if refresh_weather and settings.open_meteo_enabled:
        delta = 0.05
        try:
            weather_result = await IngestionService().run(
                OpenMeteoAdapter(),
                AreaOfInterest(longitude - delta, latitude - delta, longitude + delta, latitude + delta),
                latitude=latitude,
                longitude=longitude,
            )
        except Exception as exc:
            logger.warning("Weather refresh failed for %s, %s: %s", latitude, longitude, exc)
            weather_error = "Current modelled weather could not be refreshed; the stored zone estimate is shown unchanged."

    if nearest is None or distance is None or distance > 150:
        return {
            "query": address,
            "display_name": display_name,
            "latitude": latitude,
            "longitude": longitude,
            "matched_zone": None,
            "distance_km": round(distance, 1) if distance is not None else None,
            "risk_score": None,
            "risk_level": "UNAVAILABLE",
            "confidence": 0,
            "reasons": ["No monitored risk zone is within 150 km of this place."],
            "missing_features": ["local_susceptibility", "local_terrain", "local_risk_prediction"],
            "weather_refresh": weather_result,
            "weather_refresh_error": weather_error,
            "historical_landslides": historical_context,
            "provenance": "unavailable",
            "disclaimer": "No score means insufficient local evidence; it does not mean the place is safe.",
        }

    reasons = list(nearest.get("risk_factors") or [])
    if nearest.get("rainfall_mm") is not None:
        reasons.append(f"Nearest zone 24-hour rainfall: {nearest['rainfall_mm']} mm")
    if nearest.get("soil_moisture") is not None:
        reasons.append(f"Nearest zone soil moisture: {nearest['soil_moisture']}%")
    if nearest.get("slope_deg") is not None:
        reasons.append(f"Nearest zone slope: {nearest['slope_deg']}°")
    if historical_events:
        reasons.append(
            f"{len(historical_events)} historical landslide record(s) are stored within 100 km; "
            f"the nearest is {historical_events[0]['distance_km']} km away."
        )
    else:
        reasons.append("No historical event is stored within 100 km; catalogue coverage may be incomplete.")
    return {
        "query": address,
        "display_name": results[0]["display_name"],
        "latitude": latitude,
        "longitude": longitude,
        "matched_zone": nearest,
        "distance_km": round(distance, 1),
        "risk_score": nearest["risk_score"],
        "risk_level": nearest["risk_level"],
        "confidence": nearest["confidence"],
        "reasons": reasons,
        "missing_features": [],
        "weather_refresh": weather_result,
        "historical_landslides": historical_context,
        "provenance": nearest.get("provenance", "derived"),
        "disclaimer": "This is the nearest monitored-zone estimate, not a parcel-level prediction or confirmed landslide event.",
    }
