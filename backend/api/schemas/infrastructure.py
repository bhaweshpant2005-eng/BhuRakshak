"""Infrastructure schemas for villages, roads, and settlements."""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime


class Village(BaseModel):
    """Village information."""

    village_id: int
    village_name: str
    district: str
    state: str
    latitude: float
    longitude: float
    population: int
    zone_id: int
    risk_level: str
    critical_facilities: Optional[List[str]] = None


class Road(BaseModel):
    """Road network information."""

    road_id: int
    road_name: str
    road_type: str  # "NH", "SH", "MDR", "ODR"
    district: str
    state: str
    length_km: float
    zone_id: int
    risk_level: str
    connectivity_importance: str  # "HIGH", "MEDIUM", "LOW"


class VillageListResponse(BaseModel):
    """List of villages with optional filtering."""

    villages: List[Village]
    total: int
    zone_id: Optional[int] = None


class RoadListResponse(BaseModel):
    """List of roads with optional filtering."""

    roads: List[Road]
    total: int
    zone_id: Optional[int] = None


class LandslideHistory(BaseModel):
    """Historical landslide incident record."""

    incident_id: int
    zone_id: int
    zone_name: str
    date: datetime
    latitude: float
    longitude: float
    casualties: int
    displaced_population: int
    damage_estimate_inr: float
    trigger_factor: str
    description: str


class HistoryResponse(BaseModel):
    """Historical data response."""

    incidents: List[LandslideHistory]
    total: int
