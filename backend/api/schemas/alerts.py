"""Alert schemas for alert lifecycle management."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AlertStatus(str, Enum):
    """Alert lifecycle status."""

    ACTIVE = "ACTIVE"
    ACKNOWLEDGED = "ACKNOWLEDGED"
    MITIGATED = "MITIGATED"
    RESOLVED = "RESOLVED"


class AlertLevel(str, Enum):
    """Alert severity levels."""

    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class Alert(BaseModel):
    """Alert entity."""

    alert_id: int
    zone_id: int
    zone_name: str
    risk_level: AlertLevel
    status: AlertStatus
    triggered_at: datetime
    updated_at: datetime
    triggered_by: str  # User ID or system
    acknowledged_by: Optional[str] = None
    acknowledged_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    description: str
    affected_population: int
    recommended_action: str


class CreateAlertRequest(BaseModel):
    """Request to create a new alert."""

    zone_id: int
    risk_level: AlertLevel
    description: str
    affected_population: int
    recommended_action: str


class UpdateAlertRequest(BaseModel):
    """Request to update alert status."""

    status: AlertStatus
    notes: Optional[str] = None


class AlertResponse(BaseModel):
    """Alert API response."""

    alert_id: int
    zone_id: int
    zone_name: str
    risk_level: AlertLevel
    status: AlertStatus
    triggered_at: datetime
    updated_at: datetime
    description: str
    affected_population: int
    recommended_action: str


class AlertListResponse(BaseModel):
    """List of alerts with pagination."""

    alerts: List[AlertResponse]
    total: int
    page: int
    per_page: int
