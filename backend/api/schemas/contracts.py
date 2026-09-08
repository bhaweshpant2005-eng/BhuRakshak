from __future__ import annotations
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field, field_validator


class TokenRequest(BaseModel):
    email: str
    password: str = Field(min_length=8, max_length=128)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str


class RiskRequest(BaseModel):
    zone_id: int | None = None
    rainfall_1h: float = Field(ge=0, le=500)
    rainfall_6h: float = Field(ge=0, le=1000)
    rainfall_24h: float = Field(ge=0, le=2000)
    rainfall_7d: float = Field(ge=0, le=5000)
    soil_moisture: float = Field(ge=0, le=100)
    slope: float = Field(ge=0, le=90)
    elevation: float = Field(ge=0, le=9000)
    land_cover: float = Field(default=0.6, ge=0, le=1)
    historical_landslide_count: int = Field(ge=0, le=1000)
    distance_to_road: float = Field(default=1, ge=0, le=100)
    distance_to_river: float = Field(default=1, ge=0, le=100)
    satellite_change_score: float = Field(ge=0, le=100)


class RiskResult(BaseModel):
    risk_score: float
    risk_level: str
    confidence: float
    explanation: dict[str, float]
    recommendation: str
    model_mode: str


class ReportCreate(BaseModel):
    incident_type: str = Field(min_length=2, max_length=40)
    description: str = Field(min_length=5, max_length=3000)
    latitude: float = Field(ge=24, le=30)
    longitude: float = Field(ge=88, le=98)
    severity: str = Field(pattern="^(LOW|MODERATE|HIGH|CRITICAL)$")
    reporter_name: str = Field(default="Anonymous citizen", max_length=160)
    media: list[str] = Field(default_factory=list, max_length=5)

    @field_validator("media")
    @classmethod
    def only_safe_media_refs(cls, entries: list[str]) -> list[str]:
        if any(len(entry) > 500 for entry in entries):
            raise ValueError("Media reference is too long")
        return entries


class IncidentStatusUpdate(BaseModel):
    status: str = Field(pattern="^(REPORTED|UNDER_REVIEW|VERIFIED|RESPONDING|RESOLVED|REJECTED)$")
    observation: str = Field(default="", max_length=2000)


class ZoneOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    code: str
    name: str
    latitude: float
    longitude: float
    slope: float
    elevation: float
    population: int
    nearest_road: str
    critical_infrastructure: str
    historical_landslide_count: int
    risk_score: float
    risk_level: str


class SimulationResult(BaseModel):
    zone_id: int
    before: RiskResult
    after: RiskResult
    alert_id: str | None = None
    incident_id: str | None = None
    steps: list[str]
