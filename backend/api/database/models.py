"""Persistent domain models for monitoring, provenance and audit history."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from geoalchemy2 import Geometry
from sqlalchemy import (
    Boolean,
    CheckConstraint,
    DateTime,
    Float,
    ForeignKey,
    Index,
    Integer,
    JSON,
    String,
    Text,
    UniqueConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.api.database.base import Base, PROVENANCE_ENUM, Provenance, TimestampMixin

GEOMETRY_POINT = Geometry("POINT", srid=4326).with_variant(Text(), "sqlite")
GEOMETRY_SHAPE = Geometry("GEOMETRY", srid=4326).with_variant(Text(), "sqlite")


class DataSource(TimestampMixin, Base):
    __tablename__ = "data_sources"

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    category: Mapped[str] = mapped_column(String(40), index=True)
    provider: Mapped[str] = mapped_column(String(180))
    access_type: Mapped[str] = mapped_column(String(40))
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    status: Mapped[str] = mapped_column(String(40), index=True)
    base_url: Mapped[str | None] = mapped_column(String(500))
    license_name: Mapped[str | None] = mapped_column(String(180))
    attribution: Mapped[str | None] = mapped_column(Text())
    credential_env: Mapped[str | None] = mapped_column(String(120))
    last_success_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    last_error: Mapped[str | None] = mapped_column(Text())
    freshness_seconds: Mapped[int | None] = mapped_column(Integer())
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)


class IngestionRun(TimestampMixin, Base):
    __tablename__ = "ingestion_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), index=True)
    status: Mapped[str] = mapped_column(String(30), index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    finished_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    source_version: Mapped[str | None] = mapped_column(String(120))
    coverage_start: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    coverage_end: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    aoi_wkt: Mapped[str | None] = mapped_column(Text())
    records_read: Mapped[int] = mapped_column(Integer(), default=0)
    records_written: Mapped[int] = mapped_column(Integer(), default=0)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)
    error: Mapped[str | None] = mapped_column(Text())
    source: Mapped[DataSource] = relationship()


class RawAsset(TimestampMixin, Base):
    __tablename__ = "raw_assets"
    __table_args__ = (UniqueConstraint("source_id", "checksum", name="uq_raw_asset_checksum"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), index=True)
    ingestion_run_id: Mapped[int | None] = mapped_column(ForeignKey("ingestion_runs.id"))
    uri: Mapped[str] = mapped_column(String(1000))
    media_type: Mapped[str] = mapped_column(String(120))
    checksum: Mapped[str] = mapped_column(String(128), index=True)
    size_bytes: Mapped[int | None] = mapped_column(Integer())
    observed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    footprint: Mapped[str | None] = mapped_column(GEOMETRY_SHAPE)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)

class ProcessingJob(TimestampMixin, Base):
    __tablename__ = "processing_jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    job_type: Mapped[str] = mapped_column(String(80), index=True)
    status: Mapped[str] = mapped_column(String(30), index=True)
    source_asset_id: Mapped[int | None] = mapped_column(ForeignKey("raw_assets.id"))
    parameters: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)
    output_asset_id: Mapped[int | None] = mapped_column(ForeignKey("raw_assets.id"))
    error: Mapped[str | None] = mapped_column(Text())


class RiskZone(TimestampMixin, Base):
    __tablename__ = "risk_zones"
    __table_args__ = (
        CheckConstraint("risk_score >= 0 AND risk_score <= 100", name="risk_score_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    state: Mapped[str] = mapped_column(String(100), index=True)
    district: Mapped[str] = mapped_column(String(100), index=True)
    risk_score: Mapped[float] = mapped_column(Float())
    risk_level: Mapped[str] = mapped_column(String(20), index=True)
    confidence: Mapped[float | None] = mapped_column(Float())
    population: Mapped[int | None] = mapped_column(Integer())
    area_km2: Mapped[float | None] = mapped_column(Float())
    centroid: Mapped[str | None] = mapped_column(GEOMETRY_POINT)
    boundary: Mapped[str | None] = mapped_column(GEOMETRY_SHAPE)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    last_observed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)


class ZoneFeature(Base):
    __tablename__ = "zone_features"
    __table_args__ = (
        UniqueConstraint("zone_id", "feature_name", "observed_at", "source_id", name="uq_zone_feature"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    feature_name: Mapped[str] = mapped_column(String(100), index=True)
    value: Mapped[float | None] = mapped_column(Float())
    unit: Mapped[str | None] = mapped_column(String(40))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)


class Observation(Base):
    __tablename__ = "observations"
    __table_args__ = (
        UniqueConstraint("source_id", "external_id", "variable", "observed_at", name="uq_observation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    external_id: Mapped[str | None] = mapped_column(String(180))
    domain: Mapped[str] = mapped_column(String(40), index=True)
    variable: Mapped[str] = mapped_column(String(100), index=True)
    value: Mapped[float | None] = mapped_column(Float())
    unit: Mapped[str] = mapped_column(String(40))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    valid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    location: Mapped[str | None] = mapped_column(GEOMETRY_POINT)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)

class WeatherObservation(Base):
    __tablename__ = "weather_observations"
    __table_args__ = (
        UniqueConstraint("source_id", "zone_id", "variable", "observed_at", name="uq_weather_observation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    variable: Mapped[str] = mapped_column(String(80), index=True)
    value: Mapped[float | None] = mapped_column(Float())
    unit: Mapped[str] = mapped_column(String(40))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    valid_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)


class SoilMoistureObservation(Base):
    __tablename__ = "soil_moisture_observations"
    __table_args__ = (
        UniqueConstraint("source_id", "zone_id", "depth_cm", "observed_at", name="uq_soil_moisture"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    depth_cm: Mapped[float | None] = mapped_column(Float())
    value: Mapped[float | None] = mapped_column(Float())
    unit: Mapped[str] = mapped_column(String(40))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)


class HydrologyObservation(Base):
    __tablename__ = "hydrology_observations"
    __table_args__ = (
        UniqueConstraint("source_id", "station_external_id", "variable", "observed_at", name="uq_hydrology_observation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    station_external_id: Mapped[str | None] = mapped_column(String(180))
    variable: Mapped[str] = mapped_column(String(80), index=True)
    value: Mapped[float | None] = mapped_column(Float())
    unit: Mapped[str] = mapped_column(String(40))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    location: Mapped[str | None] = mapped_column(GEOMETRY_POINT)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)


class HydrologyForecast(Base):
    __tablename__ = "hydrology_forecasts"
    __table_args__ = (
        UniqueConstraint("source_id", "zone_id", "variable", "issued_at", "valid_at", name="uq_hydrology_forecast"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    variable: Mapped[str] = mapped_column(String(80), index=True)
    value: Mapped[float | None] = mapped_column(Float())
    unit: Mapped[str] = mapped_column(String(40))
    issued_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    valid_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)


class SatelliteScene(TimestampMixin, Base):
    __tablename__ = "satellite_scenes"
    __table_args__ = (UniqueConstraint("source_id", "external_id", name="uq_satellite_scene"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"), index=True)
    external_id: Mapped[str] = mapped_column(String(240))
    platform: Mapped[str] = mapped_column(String(80), index=True)
    product_type: Mapped[str | None] = mapped_column(String(100))
    acquired_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    footprint: Mapped[str | None] = mapped_column(GEOMETRY_SHAPE)
    cloud_cover: Mapped[float | None] = mapped_column(Float())
    catalogue_url: Mapped[str | None] = mapped_column(String(1000))
    raw_asset_id: Mapped[int | None] = mapped_column(ForeignKey("raw_assets.id"))
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)


class SatelliteEvidence(TimestampMixin, Base):
    __tablename__ = "satellite_evidence"

    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    scene_id: Mapped[int | None] = mapped_column(ForeignKey("satellite_scenes.id"), index=True)
    evidence_type: Mapped[str] = mapped_column(String(100), index=True)
    value: Mapped[float | None] = mapped_column(Float())
    confidence: Mapped[float | None] = mapped_column(Float())
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    processing_job_id: Mapped[int | None] = mapped_column(ForeignKey("processing_jobs.id"))
    notes: Mapped[str | None] = mapped_column(Text())


class LandslideEvent(TimestampMixin, Base):
    __tablename__ = "landslide_events"
    __table_args__ = (UniqueConstraint("source_id", "external_id", name="uq_landslide_event"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"), index=True)
    external_id: Mapped[str | None] = mapped_column(String(180))
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    occurred_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), index=True)
    location: Mapped[str | None] = mapped_column(GEOMETRY_POINT)
    event_type: Mapped[str | None] = mapped_column(String(80))
    fatalities: Mapped[int | None] = mapped_column(Integer())
    certainty: Mapped[str | None] = mapped_column(String(40))
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)


class InfrastructureAsset(TimestampMixin, Base):
    __tablename__ = "infrastructure_assets"
    __table_args__ = (UniqueConstraint("source_id", "external_id", name="uq_infrastructure_asset"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    external_id: Mapped[str | None] = mapped_column(String(180))
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    asset_type: Mapped[str] = mapped_column(String(60), index=True)
    name: Mapped[str] = mapped_column(String(240))
    geometry: Mapped[str | None] = mapped_column(GEOMETRY_SHAPE)
    operational_status: Mapped[str | None] = mapped_column(String(40))
    criticality: Mapped[float | None] = mapped_column(Float())
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)

class Settlement(TimestampMixin, Base):
    __tablename__ = "settlements"
    __table_args__ = (UniqueConstraint("source_id", "external_id", name="uq_settlement"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    external_id: Mapped[str | None] = mapped_column(String(180))
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    name: Mapped[str] = mapped_column(String(240), index=True)
    population: Mapped[int | None] = mapped_column(Integer())
    location: Mapped[str | None] = mapped_column(GEOMETRY_POINT)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)


class PopulationExposure(Base):
    __tablename__ = "population_exposure"
    __table_args__ = (
        UniqueConstraint("zone_id", "source_id", "reference_date", name="uq_population_exposure"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    source_id: Mapped[int] = mapped_column(ForeignKey("data_sources.id"))
    population: Mapped[int | None] = mapped_column(Integer())
    exposed_population: Mapped[int | None] = mapped_column(Integer())
    reference_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    method: Mapped[str] = mapped_column(String(100))
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)


class FieldReport(TimestampMixin, Base):
    __tablename__ = "field_reports"

    id: Mapped[int] = mapped_column(primary_key=True)
    public_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    reporter_id: Mapped[str] = mapped_column(String(120), index=True)
    reporter_type: Mapped[str] = mapped_column(String(40))
    report_type: Mapped[str] = mapped_column(String(80), index=True)
    description: Mapped[str] = mapped_column(Text())
    urgency: Mapped[str] = mapped_column(String(20))
    status: Mapped[str] = mapped_column(String(30), default="pending", index=True)
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    location: Mapped[str | None] = mapped_column(GEOMETRY_POINT)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)


class ReportAttachment(TimestampMixin, Base):
    __tablename__ = "report_attachments"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("field_reports.id"), index=True)
    raw_asset_id: Mapped[int] = mapped_column(ForeignKey("raw_assets.id"))
    caption: Mapped[str | None] = mapped_column(Text())


class ReportAnalysis(TimestampMixin, Base):
    __tablename__ = "report_analyses"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("field_reports.id"), index=True)
    provider: Mapped[str] = mapped_column(String(80))
    model: Mapped[str] = mapped_column(String(120))
    advisory_label: Mapped[str | None] = mapped_column(String(100))
    advisory_score: Mapped[float | None] = mapped_column(Float())
    summary: Mapped[str] = mapped_column(Text())
    raw_output_asset_id: Mapped[int | None] = mapped_column(ForeignKey("raw_assets.id"))
    disclaimer: Mapped[str] = mapped_column(
        Text(), default="Advisory only; this analysis is not human verification."
    )


class ReportReview(TimestampMixin, Base):
    __tablename__ = "report_reviews"

    id: Mapped[int] = mapped_column(primary_key=True)
    report_id: Mapped[int] = mapped_column(ForeignKey("field_reports.id"), index=True)
    reviewer_id: Mapped[str] = mapped_column(String(120), index=True)
    decision: Mapped[str] = mapped_column(String(30), index=True)
    severity: Mapped[float | None] = mapped_column(Float())
    notes: Mapped[str | None] = mapped_column(Text())
    reviewed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    supersedes_review_id: Mapped[int | None] = mapped_column(ForeignKey("report_reviews.id"))

class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id: Mapped[int] = mapped_column(primary_key=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    score: Mapped[float] = mapped_column(Float())
    level: Mapped[str] = mapped_column(String(20), index=True)
    confidence: Mapped[float | None] = mapped_column(Float())
    model_name: Mapped[str] = mapped_column(String(120))
    model_version: Mapped[str] = mapped_column(String(80))
    predicted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    valid_until: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    missing_features: Mapped[list[str]] = mapped_column(JSON(), default=list)
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)


class RiskContribution(Base):
    __tablename__ = "risk_contributions"

    id: Mapped[int] = mapped_column(primary_key=True)
    prediction_id: Mapped[int] = mapped_column(ForeignKey("risk_predictions.id"), index=True)
    feature_name: Mapped[str] = mapped_column(String(100))
    raw_value: Mapped[float | None] = mapped_column(Float())
    normalized_value: Mapped[float | None] = mapped_column(Float())
    weight: Mapped[float] = mapped_column(Float())
    contribution: Mapped[float | None] = mapped_column(Float())
    source_id: Mapped[int | None] = mapped_column(ForeignKey("data_sources.id"))
    observed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    provenance: Mapped[Provenance] = mapped_column(PROVENANCE_ENUM)


class Alert(TimestampMixin, Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(primary_key=True)
    public_id: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    zone_id: Mapped[int] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    prediction_id: Mapped[int | None] = mapped_column(ForeignKey("risk_predictions.id"))
    severity: Mapped[str] = mapped_column(String(20), index=True)
    title: Mapped[str] = mapped_column(String(240))
    description: Mapped[str] = mapped_column(Text())
    status: Mapped[str] = mapped_column(String(40), default="draft", index=True)
    evacuation_recommended: Mapped[bool] = mapped_column(Boolean(), default=False)
    created_by: Mapped[str] = mapped_column(String(120))


class AlertEvent(Base):
    __tablename__ = "alert_events"

    id: Mapped[int] = mapped_column(primary_key=True)
    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id"), index=True)
    event_type: Mapped[str] = mapped_column(String(60), index=True)
    actor_id: Mapped[str] = mapped_column(String(120), index=True)
    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    notes: Mapped[str | None] = mapped_column(Text())
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)


class ResponseAction(Base):
    __tablename__ = "response_actions"
    __table_args__ = (UniqueConstraint("alert_id", "action_type", name="uq_response_action"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    alert_id: Mapped[int] = mapped_column(ForeignKey("alerts.id"), index=True)
    action_type: Mapped[str] = mapped_column(String(80))
    status: Mapped[str] = mapped_column(String(30))
    recorded_by: Mapped[str] = mapped_column(String(120))
    recorded_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    notes: Mapped[str | None] = mapped_column(Text())


class SensorDevice(TimestampMixin, Base):
    __tablename__ = "sensor_devices"

    id: Mapped[int] = mapped_column(primary_key=True)
    external_id: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(180))
    zone_id: Mapped[int | None] = mapped_column(ForeignKey("risk_zones.id"), index=True)
    location: Mapped[str | None] = mapped_column(GEOMETRY_POINT)
    status: Mapped[str] = mapped_column(String(30), index=True)
    metadata_json: Mapped[dict[str, Any]] = mapped_column(JSON(), default=dict)
    observations: Mapped[list["SensorObservation"]] = relationship(back_populates="sensor")


class SensorObservation(Base):
    __tablename__ = "sensor_observations"
    __table_args__ = (
        UniqueConstraint("sensor_id", "variable", "observed_at", name="uq_sensor_observation"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    sensor_id: Mapped[int] = mapped_column(ForeignKey("sensor_devices.id"), index=True)
    variable: Mapped[str] = mapped_column(String(100), index=True)
    value: Mapped[float | None] = mapped_column(Float())
    unit: Mapped[str] = mapped_column(String(40))
    observed_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    quality_flags: Mapped[list[str]] = mapped_column(JSON(), default=list)
    sensor: Mapped[SensorDevice] = relationship(back_populates="observations")


Index("ix_risk_zones_centroid_gist", RiskZone.centroid, postgresql_using="gist")
Index("ix_risk_zones_boundary_gist", RiskZone.boundary, postgresql_using="gist")
Index("ix_observations_location_gist", Observation.location, postgresql_using="gist")
Index("ix_satellite_scenes_footprint_gist", SatelliteScene.footprint, postgresql_using="gist")
