"""Report schemas for landslide reports and assessments."""
from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum


class ReportType(str, Enum):
    """Types of reports."""

    INCIDENT = "INCIDENT"
    ASSESSMENT = "ASSESSMENT"
    PREDICTION = "PREDICTION"
    SIMULATION = "SIMULATION"


class ReportStatus(str, Enum):
    """Report status lifecycle."""

    DRAFT = "DRAFT"
    SUBMITTED = "SUBMITTED"
    REVIEWED = "REVIEWED"
    CLOSED = "CLOSED"


class Report(BaseModel):
    """Report entity."""

    report_id: int
    report_type: ReportType
    zone_id: int
    zone_name: str
    title: str
    description: str
    created_by: str  # User ID
    created_at: datetime
    updated_at: datetime
    status: ReportStatus
    risk_assessment: Optional[Dict[str, Any]] = None
    affected_areas: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None
    attachments: Optional[List[str]] = None


class CreateReportRequest(BaseModel):
    """Request to create a report."""

    report_type: ReportType
    zone_id: int
    title: str
    description: str
    risk_assessment: Optional[Dict[str, Any]] = None
    affected_areas: Optional[List[str]] = None
    recommendations: Optional[List[str]] = None


class ReportResponse(BaseModel):
    """Report API response."""

    report_id: int
    report_type: ReportType
    zone_id: int
    zone_name: str
    title: str
    description: str
    created_by: str
    created_at: datetime
    status: ReportStatus


class ReportListResponse(BaseModel):
    """List of reports with pagination."""

    reports: List[ReportResponse]
    total: int
    page: int
    per_page: int
