"""Risk prediction and zone schemas."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class RiskLevel(str, Enum):
    """Risk severity levels."""

    LOW = "LOW"
    MODERATE = "MODERATE"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class RiskScore(BaseModel):
    """Risk assessment result from ML model."""

    risk_score: float = Field(..., ge=0, le=100, description="Risk score 0-100")
    risk_level: RiskLevel
    confidence: float = Field(..., ge=0, le=1, description="Model confidence 0-1")
    risk_factors: List[str] = []
    model_version: str


class Zone(BaseModel):
    """Landslide risk zone information."""

    zone_id: int
    zone_name: str
    district: str
    state: str
    latitude: float
    longitude: float
    area_km2: float
    risk_level: RiskLevel
    last_updated: datetime
    population: int
    critical_infrastructure: Optional[List[str]] = None


class DashboardSummary(BaseModel):
    """Dashboard summary information."""

    total_zones: int
    zones_at_risk: Dict[str, int]  # {"CRITICAL": 5, "HIGH": 10, etc.}
    total_alerts_active: int
    alerts_by_level: Dict[str, int]  # {"CRITICAL": 2, "HIGH": 5, etc.}
    total_affected_population: int
    last_update_time: datetime


class RiskPredictionRequest(BaseModel):
    """Request for risk prediction."""

    zone_id: int
    rainfall_mm: Optional[float] = None
    soil_moisture_percent: Optional[float] = None
    slope_angle: Optional[float] = None
    vegetation_index: Optional[float] = None
    recent_earthquakes: bool = False


class RiskPredictionResponse(BaseModel):
    """Risk prediction response."""

    zone_id: int
    prediction: RiskScore
    timestamp: datetime
    recommended_action: Optional[str] = None
