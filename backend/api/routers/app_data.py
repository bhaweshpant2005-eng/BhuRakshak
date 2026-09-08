"""Stable frontend-facing application endpoints."""
from __future__ import annotations

from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from backend.api.dependencies.auth import get_current_user
from backend.api.schemas.auth import CurrentUser, UserRole
from backend.api.services.database import get_database_service

router = APIRouter()


class FieldReportRequest(BaseModel):
    zone_id: str
    reporter_type: Literal["CITIZEN", "FIELD_AGENT"]
    report_type: Literal["SOIL_CRACK", "ROCKFALL", "WATER_SEEPAGE", "TREE_TILT", "LANDSLIDE_IN_PROGRESS"]
    description: str = Field(min_length=5, max_length=4000)
    urgency: Literal["LOW", "MEDIUM", "HIGH"]
    observed_at: datetime


class ReviewRequest(BaseModel):
    decision: Literal["accepted", "rejected", "needs_more_information"]
    severity: float | None = Field(default=None, ge=0, le=1)
    notes: str | None = Field(default=None, max_length=4000)


class AlertDraftRequest(BaseModel):
    zone_id: str
    severity: Literal["LOW", "MODERATE", "HIGH", "CRITICAL"]
    title: str = Field(min_length=3, max_length=240)
    description: str = Field(min_length=5, max_length=4000)
    evacuation_recommended: bool = False


class ResponseActionRequest(BaseModel):
    action_type: Literal["medical", "authority", "warning_simulation"]
    status: Literal["recorded", "cancelled"]
    notes: str | None = Field(default=None, max_length=2000)


@router.get("/app/dashboard/summary")
async def dashboard_summary():
    return await get_database_service().get_dashboard_summary()


@router.get("/app/zones")
async def zones():
    return await get_database_service().get_all_zones()


@router.get("/app/zones/{zone_id}")
async def zone(zone_id: str):
    result = await get_database_service().get_zone(zone_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Zone not found")
    return result


@router.get("/app/reports")
async def reports(zone_id: str | None = None):
    return await get_database_service().list_field_reports(zone_id)


@router.post("/app/reports", status_code=status.HTTP_201_CREATED)
async def create_report(request: FieldReportRequest, user: CurrentUser = Depends(get_current_user)):
    try:
        return await get_database_service().create_field_report(
            zone_id=request.zone_id,
            reporter_id=user.user_id,
            reporter_type=request.reporter_type,
            report_type=request.report_type,
            description=request.description,
            urgency=request.urgency,
            observed_at=request.observed_at,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Zone not found") from exc


@router.post("/app/reports/{report_id}/reviews")
async def review_report(report_id: str, request: ReviewRequest, user: CurrentUser = Depends(get_current_user)):
    if user.role not in {UserRole.ADMIN, UserRole.AUTHORITY}:
        raise HTTPException(status_code=403, detail="Human authority review is required")
    try:
        return await get_database_service().review_report(
            public_id=report_id,
            reviewer_id=user.user_id,
            decision=request.decision,
            severity=request.severity,
            notes=request.notes,
        )
    except ValueError as exc:
        raise HTTPException(status_code=404, detail="Report not found") from exc


@router.get("/app/alerts")
async def alerts():
    return await get_database_service().list_alerts()


@router.post("/app/alerts", status_code=status.HTTP_201_CREATED)
async def create_alert(request: AlertDraftRequest, user: CurrentUser = Depends(get_current_user)):
    if user.role not in {UserRole.ADMIN, UserRole.AUTHORITY, UserRole.FIELD_OFFICER}:
        raise HTTPException(status_code=403, detail="Role cannot draft alerts")
    return await get_database_service().create_alert_draft(**request.model_dump(), actor_id=user.user_id)


@router.post("/app/alerts/{alert_id}/approve-simulation")
async def approve_simulation(alert_id: str, user: CurrentUser = Depends(get_current_user)):
    if user.role not in {UserRole.ADMIN, UserRole.AUTHORITY}:
        raise HTTPException(status_code=403, detail="Authority role is required")
    return await get_database_service().approve_alert_simulation(alert_id, user.user_id)


@router.put("/app/alerts/{alert_id}/response-actions")
async def response_action(alert_id: str, request: ResponseActionRequest, user: CurrentUser = Depends(get_current_user)):
    return await get_database_service().record_response_action(
        public_alert_id=alert_id,
        action_type=request.action_type,
        status=request.status,
        actor_id=user.user_id,
        notes=request.notes,
    )
