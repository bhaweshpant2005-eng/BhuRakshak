"""PostgreSQL/SQLite repositories used by the FastAPI application."""
from __future__ import annotations

from datetime import datetime, timezone
from math import asin, cos, radians, sin, sqrt
from typing import Any
from uuid import uuid4

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.database.base import Provenance
from backend.api.database.models import (
    Alert,
    AlertEvent,
    DataSource,
    FieldReport,
    InfrastructureAsset,
    IngestionRun,
    LandslideEvent,
    ReportAnalysis,
    ReportReview,
    ResponseAction,
    RiskContribution,
    RiskPrediction,
    RiskZone,
    Settlement,
)
from backend.api.database.session import get_session_factory
from backend.api.integrations.institutional import INSTITUTIONAL_SOURCES


class DatabaseService:
    """Transaction-aware repository facade for application workflows."""

    def __init__(self) -> None:
        self._session_factory = get_session_factory()

    @staticmethod
    def _distance_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
        dlat = radians(lat2 - lat1)
        dlng = radians(lng2 - lng1)
        value = sin(dlat / 2) ** 2 + cos(radians(lat1)) * cos(radians(lat2)) * sin(dlng / 2) ** 2
        return 6371 * 2 * asin(sqrt(value))

    @staticmethod
    def _point_coordinates(value: str | None, metadata: dict[str, Any]) -> tuple[float | None, float | None]:
        latitude = metadata.get("latitude", metadata.get("lat"))
        longitude = metadata.get("longitude", metadata.get("lng"))
        if latitude is not None and longitude is not None:
            return float(latitude), float(longitude)
        if value and value.upper().startswith("POINT("):
            try:
                longitude_text, latitude_text = value[value.index("(") + 1:value.index(")")].split()
                return float(latitude_text), float(longitude_text)
            except (ValueError, IndexError):
                pass
        return None, None

    @staticmethod
    def _zone_payload(zone: RiskZone) -> dict[str, Any]:
        metadata = zone.metadata_json or {}
        return {
            "zone_id": zone.zone_id,
            "name": zone.name,
            "state": zone.state,
            "district": zone.district,
            "risk_score": zone.risk_score,
            "risk_level": zone.risk_level,
            "confidence": (zone.confidence or 0) * 100,
            "rainfall_mm": metadata.get("rainfall_mm"),
            "soil_moisture": metadata.get("soil_moisture"),
            "slope_deg": metadata.get("slope_deg"),
            "elevation_m": metadata.get("elevation_m"),
            "historical_events": metadata.get("historical_events", 0),
            "affected_villages": metadata.get("affected_villages", []),
            "affected_roads": metadata.get("affected_roads", []),
            "risk_factors": metadata.get("risk_factors", []),
            "geometry": {"lat": metadata.get("lat"), "lng": metadata.get("lng")},
            "last_updated": (zone.last_observed_at or zone.updated_at).isoformat(),
            "provenance": zone.provenance.value,
        }

    async def get_zone(self, zone_id: str | int) -> dict[str, Any] | None:
        async with self._session_factory() as session:
            statement = select(RiskZone).where(
                RiskZone.zone_id == str(zone_id) if isinstance(zone_id, str) else RiskZone.id == zone_id
            )
            zone = await session.scalar(statement)
            return self._zone_payload(zone) if zone else None

    async def get_all_zones(self) -> list[dict[str, Any]]:
        async with self._session_factory() as session:
            zones = (await session.scalars(select(RiskZone).order_by(RiskZone.risk_score.desc()))).all()
            return [self._zone_payload(zone) for zone in zones]

    async def get_dashboard_summary(self) -> dict[str, Any]:
        async with self._session_factory() as session:
            zones = (await session.scalars(select(RiskZone))).all()
            active_alerts = await session.scalar(
                select(func.count(Alert.id)).where(Alert.status.in_(["draft", "approved_simulation"]))
            )
        counts = {level: 0 for level in ("LOW", "MODERATE", "HIGH", "CRITICAL")}
        for zone in zones:
            counts[zone.risk_level] = counts.get(zone.risk_level, 0) + 1
        return {
            "total_zones": len(zones),
            "critical_zones": counts["CRITICAL"],
            "high_zones": counts["HIGH"],
            "moderate_zones": counts["MODERATE"],
            "low_zones": counts["LOW"],
            "active_alerts": active_alerts or 0,
            "high_risk_villages": sum(
                len((zone.metadata_json or {}).get("affected_villages", []))
                for zone in zones if zone.risk_level in {"HIGH", "CRITICAL"}
            ),
            "blocked_roads_count": 0,
            "last_updated": max((zone.updated_at for zone in zones), default=datetime.now(timezone.utc)).isoformat(),
            "provenance": "prepared_demo" if any(zone.provenance == Provenance.PREPARED_DEMO for zone in zones) else "derived",
        }

    async def list_settlements(self, zone_id: str | None = None) -> list[dict[str, Any]]:
        async with self._session_factory() as session:
            statement = select(Settlement, RiskZone).join(RiskZone, Settlement.zone_id == RiskZone.id)
            if zone_id:
                statement = statement.where(RiskZone.zone_id == zone_id)
            rows = (await session.execute(statement.order_by(Settlement.name))).all()
            result = []
            for settlement, zone in rows:
                metadata = settlement.metadata_json or {}
                latitude, longitude = self._point_coordinates(settlement.location, metadata)
                result.append({
                    "id": settlement.external_id or f"settlement-{settlement.id}",
                    "name": settlement.name,
                    "district": zone.district,
                    "state": zone.state,
                    "population": settlement.population or 0,
                    "risk_score": zone.risk_score,
                    "risk_level": zone.risk_level,
                    "nearest_zone_id": zone.zone_id,
                    "coordinates": {"lat": latitude, "lng": longitude},
                    "provenance": settlement.provenance.value,
                })
            return result

    async def list_roads(self, zone_id: str | None = None) -> list[dict[str, Any]]:
        async with self._session_factory() as session:
            statement = (
                select(InfrastructureAsset, RiskZone)
                .join(RiskZone, InfrastructureAsset.zone_id == RiskZone.id)
                .where(InfrastructureAsset.asset_type == "road")
            )
            if zone_id:
                statement = statement.where(RiskZone.zone_id == zone_id)
            rows = (await session.execute(statement.order_by(InfrastructureAsset.name))).all()
            result = []
            for road, zone in rows:
                metadata = road.metadata_json or {}
                status = (road.operational_status or "open").upper()
                if status not in {"OPEN", "WARNING", "HIGH_RISK", "BLOCKED"}:
                    status = "WARNING" if zone.risk_level in {"HIGH", "CRITICAL"} else "OPEN"
                result.append({
                    "id": road.external_id or f"road-{road.id}",
                    "name": road.name,
                    "highway_code": metadata.get("highway_code") or road.name.split()[0],
                    "start_point": metadata.get("start_point", zone.name),
                    "end_point": metadata.get("end_point", zone.district),
                    "status": status,
                    "risk_score": zone.risk_score,
                    "coordinates": metadata.get("coordinates", []),
                    "zone_id": zone.zone_id,
                    "provenance": road.provenance.value,
                })
            return result

    async def list_landslide_events(self, zone_id: str | None = None) -> list[dict[str, Any]]:
        async with self._session_factory() as session:
            statement = select(LandslideEvent, RiskZone, DataSource).outerjoin(
                RiskZone, LandslideEvent.zone_id == RiskZone.id
            ).outerjoin(DataSource, LandslideEvent.source_id == DataSource.id)
            if zone_id:
                statement = statement.where(RiskZone.zone_id == zone_id)
            rows = (await session.execute(statement.order_by(LandslideEvent.occurred_at.desc()))).all()
            result = []
            for event, zone, source in rows:
                metadata = event.metadata_json or {}
                latitude, longitude = self._point_coordinates(event.location, metadata)
                result.append({
                    "id": event.external_id or f"landslide-{event.id}",
                    "date": event.occurred_at.isoformat() if event.occurred_at else None,
                    "location": metadata.get("location_name") or (zone.name if zone else "Location unavailable"),
                    "state": metadata.get("state") or (zone.state if zone else "Unknown"),
                    "district": metadata.get("district") or (zone.district if zone else "Unknown"),
                    "risk_score_at_event": metadata.get("risk_score_at_event"),
                    "rainfall_recorded_mm": metadata.get("rainfall_recorded_mm"),
                    "slope_deg": metadata.get("slope_deg"),
                    "casualties": event.fatalities or 0,
                    "damage_summary": metadata.get("damage_summary", "No damage summary supplied"),
                    "latitude": latitude,
                    "longitude": longitude,
                    "event_type": event.event_type,
                    "certainty": event.certainty,
                    "source_name": source.name if source else None,
                    "provenance": event.provenance.value,
                    "zone_id": zone.zone_id if zone else None,
                })
            return result

    async def find_nearby_landslide_events(
        self,
        latitude: float,
        longitude: float,
        radius_km: float = 100,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        events = await self.list_landslide_events()
        nearby = []
        for event in events:
            if event["latitude"] is None or event["longitude"] is None:
                continue
            distance = self._distance_km(latitude, longitude, event["latitude"], event["longitude"])
            if distance <= radius_km:
                nearby.append({**event, "distance_km": round(distance, 1)})
        return sorted(nearby, key=lambda item: item["distance_km"])[:limit]

    async def get_sources(self) -> list[dict[str, Any]]:
        async with self._session_factory() as session:
            sources = (await session.scalars(select(DataSource).order_by(DataSource.category, DataSource.name))).all()
            return [{
                "slug": source.slug,
                "name": source.name,
                "category": source.category,
                "provider": source.provider,
                "access_type": source.access_type,
                "provenance": source.provenance.value,
                "status": source.status,
                "license_name": source.license_name,
                "attribution": source.attribution,
                "credential_env": source.credential_env,
                "last_success_at": source.last_success_at,
                "last_error": source.last_error,
                "freshness_seconds": source.freshness_seconds,
                "metadata": source.metadata_json,
                **(
                    INSTITUTIONAL_SOURCES[source.slug].public_capabilities()
                    if source.slug in INSTITUTIONAL_SOURCES
                    else {
                        "credential_configured": source.status == "configured" and bool(source.credential_env),
                        "file_import_available": source.status == "import_available",
                        "provider_adapter_status": "available" if source.status == "configured" else "not_available",
                        "accepted_formats": [],
                        "authorization_required": False,
                        "operator_guidance": (source.metadata_json or {}).get("notes"),
                    }
                ),
            } for source in sources]

    async def list_ingestion_runs(
        self,
        limit: int = 50,
        source_slug: str | None = None,
    ) -> list[dict[str, Any]]:
        async with self._session_factory() as session:
            statement = (
                select(IngestionRun, DataSource)
                .join(DataSource, IngestionRun.source_id == DataSource.id)
                .order_by(IngestionRun.started_at.desc())
                .limit(min(max(limit, 1), 200))
            )
            if source_slug:
                statement = statement.where(DataSource.slug == source_slug)
            rows = (await session.execute(statement)).all()
            return [
                {
                    "id": run.id,
                    "source_slug": source.slug,
                    "source_name": source.name,
                    "status": run.status,
                    "started_at": run.started_at,
                    "finished_at": run.finished_at,
                    "coverage_start": run.coverage_start,
                    "coverage_end": run.coverage_end,
                    "records_read": run.records_read,
                    "records_written": run.records_written,
                    "quality_flags": run.quality_flags,
                    "error": run.error,
                    "ingestion_method": run.ingestion_method,
                    "original_filename": run.original_filename,
                    "media_type": run.media_type,
                    "checksum": run.checksum,
                }
                for run, source in rows
            ]

    async def create_field_report(
        self,
        *,
        zone_id: str,
        reporter_id: str,
        reporter_type: str,
        report_type: str,
        description: str,
        urgency: str,
        observed_at: datetime,
    ) -> dict[str, Any]:
        async with self._session_factory.begin() as session:
            zone = await session.scalar(select(RiskZone).where(RiskZone.zone_id == zone_id))
            if zone is None:
                raise ValueError("zone_not_found")
            report = FieldReport(
                public_id=f"FR-{uuid4().hex[:12].upper()}",
                zone_id=zone.id,
                reporter_id=reporter_id,
                reporter_type=reporter_type,
                report_type=report_type,
                description=description,
                urgency=urgency,
                status="pending",
                observed_at=observed_at,
                provenance=Provenance.LIVE_OBSERVED,
            )
            session.add(report)
            await session.flush()
            return self._report_payload(report, zone)

    async def list_field_reports(self, zone_id: str | None = None) -> list[dict[str, Any]]:
        async with self._session_factory() as session:
            statement = select(FieldReport, RiskZone).outerjoin(RiskZone, FieldReport.zone_id == RiskZone.id)
            if zone_id:
                statement = statement.where(RiskZone.zone_id == zone_id)
            rows = (await session.execute(statement.order_by(FieldReport.observed_at.desc()))).all()
            return [self._report_payload(report, zone) for report, zone in rows]

    @staticmethod
    def _report_payload(report: FieldReport, zone: RiskZone | None) -> dict[str, Any]:
        return {
            "id": report.public_id,
            "zone_id": zone.zone_id if zone else None,
            "reporter_type": report.reporter_type,
            "location_description": report.description,
            "report_type": report.report_type,
            "urgency": report.urgency,
            "timestamp": report.observed_at.isoformat(),
            "status": report.status,
            "verified": report.status == "verified",
            "provenance": report.provenance.value,
        }

    async def review_report(
        self,
        *,
        public_id: str,
        reviewer_id: str,
        decision: str,
        severity: float | None,
        notes: str | None,
    ) -> dict[str, Any]:
        """Atomically append review, update report and append recalculated risk."""
        async with self._session_factory.begin() as session:
            report = await session.scalar(
                select(FieldReport).where(FieldReport.public_id == public_id).with_for_update()
            )
            if report is None:
                raise ValueError("report_not_found")
            previous = await session.scalar(
                select(ReportReview).where(ReportReview.report_id == report.id).order_by(ReportReview.reviewed_at.desc())
            )
            review = ReportReview(
                report_id=report.id,
                reviewer_id=reviewer_id,
                decision=decision,
                severity=severity,
                notes=notes,
                reviewed_at=datetime.now(timezone.utc),
                supersedes_review_id=previous.id if previous else None,
            )
            session.add(review)
            report.status = "verified" if decision == "accepted" else "rejected"
            zone = await session.get(RiskZone, report.zone_id) if report.zone_id else None
            prediction_id = None
            if decision == "accepted" and zone is not None:
                latest = await session.scalar(
                    select(RiskPrediction).where(RiskPrediction.zone_id == zone.id).order_by(RiskPrediction.predicted_at.desc())
                )
                base_score = latest.score if latest else zone.risk_score
                field_contribution = min(max(severity or 0.5, 0), 1) * 8
                score = min(100, round(base_score + field_contribution, 2))
                level = "CRITICAL" if score >= 75 else "HIGH" if score >= 58 else "MODERATE" if score >= 38 else "LOW"
                prediction = RiskPrediction(
                    zone_id=zone.id,
                    score=score,
                    level=level,
                    confidence=latest.confidence if latest else 0.65,
                    model_name="transparent-weighted-risk",
                    model_version="1.0",
                    predicted_at=datetime.now(timezone.utc),
                    missing_features=latest.missing_features if latest else [],
                    provenance=Provenance.DERIVED,
                )
                session.add(prediction)
                await session.flush()
                session.add(RiskContribution(
                    prediction_id=prediction.id,
                    feature_name="verified_field_evidence",
                    raw_value=severity,
                    normalized_value=severity,
                    weight=0.08,
                    contribution=field_contribution,
                    observed_at=report.observed_at,
                    provenance=report.provenance,
                ))
                zone.risk_score = score
                zone.risk_level = level
                prediction_id = prediction.id
            await session.flush()
            return {"report_id": report.public_id, "status": report.status, "review_id": review.id, "prediction_id": prediction_id}

    async def create_alert_draft(
        self,
        *,
        zone_id: str,
        severity: str,
        title: str,
        description: str,
        evacuation_recommended: bool,
        actor_id: str,
    ) -> dict[str, Any]:
        async with self._session_factory.begin() as session:
            zone = await session.scalar(select(RiskZone).where(RiskZone.zone_id == zone_id))
            if zone is None:
                raise ValueError("zone_not_found")
            alert = Alert(
                public_id=f"ALERT-{uuid4().hex[:12].upper()}",
                zone_id=zone.id,
                severity=severity,
                title=title,
                description=description,
                status="draft",
                evacuation_recommended=evacuation_recommended,
                created_by=actor_id,
            )
            session.add(alert)
            await session.flush()
            session.add(AlertEvent(
                alert_id=alert.id,
                event_type="draft_created",
                actor_id=actor_id,
                occurred_at=datetime.now(timezone.utc),
                metadata_json={"dispatch": "disabled"},
            ))
            return {"id": alert.public_id, "zone_id": zone.zone_id, "status": alert.status, "severity": alert.severity, "title": alert.title, "description": alert.description, "public_dispatch": "disabled"}

    async def approve_alert_simulation(self, public_id: str, actor_id: str) -> dict[str, Any]:
        async with self._session_factory.begin() as session:
            alert = await session.scalar(select(Alert).where(Alert.public_id == public_id).with_for_update())
            if alert is None:
                raise ValueError("alert_not_found")
            alert.status = "approved_simulation"
            session.add(AlertEvent(
                alert_id=alert.id,
                event_type="approved_simulation",
                actor_id=actor_id,
                occurred_at=datetime.now(timezone.utc),
                notes="Simulation approved; no public channel was contacted.",
                metadata_json={"dispatch": "disabled"},
            ))
            return {"id": alert.public_id, "status": alert.status, "public_dispatch": "disabled"}

    async def list_alerts(self) -> list[dict[str, Any]]:
        async with self._session_factory() as session:
            rows = (await session.execute(select(Alert, RiskZone).join(RiskZone, Alert.zone_id == RiskZone.id).order_by(Alert.created_at.desc()))).all()
            return [{
                "id": alert.public_id,
                "zone_id": zone.zone_id,
                "zone_name": zone.name,
                "severity": alert.severity,
                "title": alert.title,
                "description": alert.description,
                "timestamp": alert.created_at.isoformat(),
                "acknowledged": alert.status not in {"draft", "approved_simulation"},
                "evacuation_recommended": alert.evacuation_recommended,
                "status": alert.status,
                "public_dispatch": "disabled",
            } for alert, zone in rows]

    async def record_response_action(
        self, *, public_alert_id: str, action_type: str, status: str, actor_id: str, notes: str | None
    ) -> dict[str, Any]:
        async with self._session_factory.begin() as session:
            alert = await session.scalar(select(Alert).where(Alert.public_id == public_alert_id))
            if alert is None:
                raise ValueError("alert_not_found")
            action = await session.scalar(select(ResponseAction).where(ResponseAction.alert_id == alert.id, ResponseAction.action_type == action_type))
            now = datetime.now(timezone.utc)
            if action is None:
                action = ResponseAction(alert_id=alert.id, action_type=action_type, status=status, recorded_by=actor_id, recorded_at=now, notes=notes)
                session.add(action)
            else:
                action.status = status
                action.recorded_by = actor_id
                action.recorded_at = now
                action.notes = notes
            return {"alert_id": public_alert_id, "action_type": action_type, "status": status, "recorded_at": now.isoformat(), "dispatch": "not_performed_by_application"}


_db_service: DatabaseService | None = None


def get_database_service() -> DatabaseService:
    global _db_service
    if _db_service is None:
        _db_service = DatabaseService()
    return _db_service
