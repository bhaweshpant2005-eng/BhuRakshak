"""Data-source catalogue, provenance and ingestion status endpoints."""
from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from backend.api.integrations.base import AreaOfInterest
from backend.api.integrations.copernicus import CopernicusStacAdapter
from backend.api.integrations.open_meteo import OpenMeteoAdapter
from backend.api.services.database import get_database_service
from backend.api.services.ingestion import IngestionService

router = APIRouter()


class RefreshRequest(BaseModel):
    west: float = Field(ge=-180, le=180)
    south: float = Field(ge=-90, le=90)
    east: float = Field(ge=-180, le=180)
    north: float = Field(ge=-90, le=90)
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)


@router.get("/sources")
async def get_sources():
    """List configured, optional and authorization-required sources."""
    return {"sources": await get_database_service().get_sources()}


@router.get("/sources/status")
async def get_source_status():
    sources = await get_database_service().get_sources()
    return {
        "sources": sources,
        "public_alert_dispatch": "disabled",
        "satellite_processing": "worker_required",
        "demo_records_are_live": False,
    }


@router.post("/sources/open-meteo/refresh")
async def refresh_open_meteo(request: RefreshRequest):
    """Refresh modelled weather for one bounded AOI."""
    aoi = AreaOfInterest(request.west, request.south, request.east, request.north)
    return await IngestionService().run(
        OpenMeteoAdapter(),
        aoi,
        latitude=request.latitude,
        longitude=request.longitude,
    )


@router.post("/sources/copernicus/search")
async def search_copernicus(request: RefreshRequest):
    """Persist public catalogue metadata; this does not process satellite evidence."""
    aoi = AreaOfInterest(request.west, request.south, request.east, request.north)
    return await IngestionService().run(CopernicusStacAdapter(), aoi)
