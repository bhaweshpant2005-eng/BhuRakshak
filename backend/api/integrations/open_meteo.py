"""Open-Meteo modelled weather and soil adapter."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from typing import Any

import httpx

from backend.api.config import settings
from backend.api.database.base import Provenance
from backend.api.integrations.base import (
    AreaOfInterest,
    IngestionBatch,
    SourceAdapter,
    SourceDescriptor,
)


class OpenMeteoAdapter(SourceAdapter):
    descriptor = SourceDescriptor(
        slug="open-meteo",
        name="Open-Meteo Forecast",
        category="weather_soil",
        provider="Open-Meteo",
        access_type="public",
        provenance=Provenance.LIVE_MODELLED,
        status="configured",
        attribution="Weather forecasts by Open-Meteo",
    )

    def __init__(self, client: httpx.AsyncClient | None = None) -> None:
        self._client = client

    async def fetch(self, aoi: AreaOfInterest, **kwargs: Any) -> IngestionBatch:
        latitude = kwargs.get("latitude", (aoi.south + aoi.north) / 2)
        longitude = kwargs.get("longitude", (aoi.west + aoi.east) / 2)
        params = {
            "latitude": latitude,
            "longitude": longitude,
            "hourly": "precipitation,soil_moisture_0_to_7cm,soil_moisture_7_to_28cm",
            "past_days": 3,
            "forecast_days": 3,
            "timezone": "UTC",
        }
        owns_client = self._client is None
        client = self._client or httpx.AsyncClient(timeout=httpx.Timeout(15.0))
        try:
            response: httpx.Response | None = None
            for attempt in range(3):
                try:
                    response = await client.get(f"{settings.open_meteo_base_url}/forecast", params=params)
                    response.raise_for_status()
                    break
                except (httpx.TimeoutException, httpx.TransportError):
                    if attempt == 2:
                        raise
            assert response is not None
            payload = response.json()
        finally:
            if owns_client:
                await client.aclose()

        records = self._normalize(payload)
        times = [record["observed_at"] for record in records]
        return IngestionBatch(
            source_slug=self.descriptor.slug,
            source_version=payload.get("generationtime_ms") and "open-meteo-forecast",
            coverage_start=min(times) if times else None,
            coverage_end=max(times) if times else None,
            records=records,
            raw_payload=json.dumps(payload, separators=(",", ":")).encode(),
            quality_flags=["modelled_not_gauge_observed"],
        )

    @staticmethod
    def _normalize(payload: dict[str, Any]) -> list[dict[str, Any]]:
        hourly = payload.get("hourly", {})
        units = payload.get("hourly_units", {})
        times = hourly.get("time", [])
        variable_map = {
            "precipitation": "rainfall_hourly",
            "soil_moisture_0_to_7cm": "soil_moisture_surface",
            "soil_moisture_7_to_28cm": "soil_moisture_subsurface",
        }
        records: list[dict[str, Any]] = []
        for index, timestamp in enumerate(times):
            observed_at = datetime.fromisoformat(timestamp).replace(tzinfo=timezone.utc)
            for remote_name, variable in variable_map.items():
                values = hourly.get(remote_name, [])
                value = values[index] if index < len(values) else None
                records.append({
                    "domain": "weather" if remote_name == "precipitation" else "soil",
                    "variable": variable,
                    "value": value,
                    "unit": units.get(remote_name, "unknown"),
                    "observed_at": observed_at,
                    "provenance": Provenance.LIVE_MODELLED.value,
                    "quality_flags": [] if value is not None else ["missing_value"],
                })
        return records
