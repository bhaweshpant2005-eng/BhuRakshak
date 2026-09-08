"""Data-source catalogue, provenance and ingestion status endpoints."""
from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile
from pydantic import BaseModel, Field

from backend.api.dependencies.auth import require_role
from backend.api.integrations.base import AreaOfInterest
from backend.api.integrations.copernicus import CopernicusStacAdapter
from backend.api.integrations.file_import import FileImportAdapter
from backend.api.integrations.institutional import INSTITUTIONAL_SOURCES
from backend.api.integrations.open_meteo import OpenMeteoAdapter
from backend.api.schemas.auth import CurrentUser, UserRole
from backend.api.services.database import get_database_service
from backend.api.services.ingestion import IngestionService
from backend.api.services.source_imports import stage_upload, validate_aoi

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


@router.get("/sources/ingestion-runs")
async def get_ingestion_runs(
    limit: int = Query(default=50, ge=1, le=200),
    source_slug: str | None = Query(default=None),
):
    """List recent runs without exposing operator or authorization identities."""
    return {"runs": await get_database_service().list_ingestion_runs(limit, source_slug)}


@router.post(
    "/sources/open-meteo/refresh",
    dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.AUTHORITY, UserRole.FIELD_OFFICER))],
)
async def refresh_open_meteo(request: RefreshRequest):
    """Refresh modelled weather for one bounded AOI."""
    aoi = AreaOfInterest(request.west, request.south, request.east, request.north)
    return await IngestionService().run(
        OpenMeteoAdapter(),
        aoi,
        latitude=request.latitude,
        longitude=request.longitude,
    )


@router.post(
    "/sources/copernicus/search",
    dependencies=[Depends(require_role(UserRole.ADMIN, UserRole.AUTHORITY, UserRole.FIELD_OFFICER))],
)
async def search_copernicus(request: RefreshRequest):
    """Persist public catalogue metadata; this does not process satellite evidence."""
    aoi = AreaOfInterest(request.west, request.south, request.east, request.north)
    return await IngestionService().run(CopernicusStacAdapter(), aoi)


@router.post("/sources/{source_slug}/imports")
async def import_institutional_file(
    source_slug: str,
    file: UploadFile = File(...),
    west: float = Form(...),
    south: float = Form(...),
    east: float = Form(...),
    north: float = Form(...),
    source_version: str = Form(..., min_length=1, max_length=120),
    authorization_reference: str = Form(..., min_length=3, max_length=300),
    license_reference: str = Form(..., min_length=3, max_length=500),
    terms_acknowledged: bool = Form(...),
    observed_at: datetime | None = Form(default=None),
    variable: str = Form(default="imported_asset", max_length=100),
    unit: str = Form(default="unknown", max_length=40),
    current_user: CurrentUser = Depends(require_role(UserRole.ADMIN, UserRole.AUTHORITY)),
):
    """Import an authorized institutional export through the audited pipeline."""
    if source_slug not in INSTITUTIONAL_SOURCES:
        raise HTTPException(status_code=404, detail="Unsupported institutional source")
    if not terms_acknowledged:
        raise HTTPException(status_code=422, detail="Provider terms and authorization must be acknowledged")
    validate_aoi(west, south, east, north)
    staged_path = await stage_upload(source_slug, file)
    observed = observed_at or datetime.now(timezone.utc)
    if observed.tzinfo is None:
        observed = observed.replace(tzinfo=timezone.utc)
    metadata = {
        "authorization_reference": authorization_reference.strip(),
        "license_reference": license_reference.strip(),
        "source_version": source_version.strip(),
        "variable": variable.strip() or "imported_asset",
        "unit": unit.strip() or "unknown",
    }
    try:
        return await IngestionService().run(
            FileImportAdapter(source_slug, staged_path, metadata),
            AreaOfInterest(west, south, east, north),
            observed_at=observed,
            audit_context={
                "ingestion_method": "authorized_file_import",
                "initiated_by": current_user.user_id,
                "initiator_role": current_user.role.value,
                "authorization_reference": authorization_reference.strip(),
                "license_reference": license_reference.strip(),
                "original_filename": file.filename,
                "media_type": file.content_type,
            },
        )
    finally:
        staged_path.unlink(missing_ok=True)
