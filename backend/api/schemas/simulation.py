"""Simulation and scenario schemas."""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum


class PriorityLevel(str, Enum):
    """Priority levels for alerts."""

    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class SimulationRequest(BaseModel):
    """Scenario simulation request."""

    zone_id: int
    rainfall_change_percent: float = Field(..., description="Rainfall change in percentage")
    duration_hours: int = Field(..., ge=1, le=168, description="Duration in hours (1-7 days)")
    soil_moisture_percent: Optional[float] = None


class SimulationResult(BaseModel):
    """Single simulation result with risk assessment."""

    risk_score: float
    risk_level: str
    confidence: float
    risk_factors: List[str]


class AffectedArea(BaseModel):
    """Area affected by projected scenario."""

    name: str
    type: str  # "village", "road", "settlement"
    latitude: float
    longitude: float
    population: Optional[int] = None
    distance_km: float


class SimulationResponse(BaseModel):
    """Complete simulation response."""

    zone_id: int
    scenario: Dict[str, Any]  # The input scenario params
    current: SimulationResult
    projected: SimulationResult
    affected_villages: List[AffectedArea]
    affected_roads: List[AffectedArea]
    recommended_priority: PriorityLevel
    timestamp: datetime
