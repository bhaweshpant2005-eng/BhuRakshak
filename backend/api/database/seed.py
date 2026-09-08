"""Idempotent prepared demonstration data for Northeast India."""
from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from backend.api.database.base import Provenance
from backend.api.database.models import (
    Alert,
    AlertEvent,
    DataSource,
    FieldReport,
    InfrastructureAsset,
    ReportReview,
    RiskContribution,
    RiskPrediction,
    RiskZone,
    SatelliteEvidence,
    SatelliteScene,
    ZoneFeature,
)
from backend.api.integrations.catalogue import source_catalogue

NOW = datetime(2026, 9, 9, 6, 0, tzinfo=timezone.utc)

ZONES = [
    {
        "zone_id": "ner-sikkim-gangtok-01",
        "name": "Gangtok–Rangpo Corridor",
        "state": "Sikkim",
        "district": "Gangtok",
        "risk_score": 86.0,
        "risk_level": "CRITICAL",
        "confidence": 0.82,
        "population": 18600,
        "area_km2": 118.4,
        "centroid": "POINT(88.565 27.265)",
        "metadata_json": {
            "lat": 27.265,
            "lng": 88.565,
            "rainfall_mm": 184.0,
            "soil_moisture": 78.0,
            "slope_deg": 37.0,
            "elevation_m": 1420.0,
            "historical_events": 14,
            "affected_villages": ["Rangpo", "Singtam", "Majitar"],
            "affected_roads": ["NH-10", "Rangpo–Singtam Road"],
            "risk_factors": ["72-hour rainfall", "steep cut slopes", "saturated soil"],
        },
    },
    {
        "zone_id": "ner-meghalaya-east-khasi-01",
        "name": "Shillong–Sohra Escarpment",
        "state": "Meghalaya",
        "district": "East Khasi Hills",
        "risk_score": 73.0,
        "risk_level": "HIGH",
        "confidence": 0.78,
        "population": 24100,
        "area_km2": 206.2,
        "centroid": "POINT(91.812 25.402)",
        "metadata_json": {
            "lat": 25.402,
            "lng": 91.812,
            "rainfall_mm": 231.0,
            "soil_moisture": 72.0,
            "slope_deg": 31.0,
            "elevation_m": 1320.0,
            "historical_events": 11,
            "affected_villages": ["Mawkdok", "Laitryngew", "Mawsmai"],
            "affected_roads": ["NH-206", "Shillong–Sohra Road"],
            "risk_factors": ["intense rainfall", "weathered rock", "road-cut instability"],
        },
    },
    {
        "zone_id": "ner-mizoram-aizawl-01",
        "name": "Aizawl Western Slopes",
        "state": "Mizoram",
        "district": "Aizawl",
        "risk_score": 67.0,
        "risk_level": "HIGH",
        "confidence": 0.75,
        "population": 32700,
        "area_km2": 94.8,
        "centroid": "POINT(92.705 23.728)",
        "metadata_json": {
            "lat": 23.728,
            "lng": 92.705,
            "rainfall_mm": 146.0,
            "soil_moisture": 69.0,
            "slope_deg": 34.0,
            "elevation_m": 1018.0,
            "historical_events": 19,
            "affected_villages": ["Durtlang", "Bawngkawn", "Zemabawk"],
            "affected_roads": ["NH-6", "Aizawl Bypass"],
            "risk_factors": ["slope modification", "drainage concentration", "field cracks"],
        },
    },
    {
        "zone_id": "ner-arunachal-papum-pare-01",
        "name": "Itanagar–Naharlagun Slopes",
        "state": "Arunachal Pradesh",
        "district": "Papum Pare",
        "risk_score": 49.0,
        "risk_level": "MODERATE",
        "confidence": 0.71,
        "population": 16800,
        "area_km2": 154.1,
        "centroid": "POINT(93.666 27.095)",
        "metadata_json": {
            "lat": 27.095,
            "lng": 93.666,
            "rainfall_mm": 102.0,
            "soil_moisture": 61.0,
            "slope_deg": 28.0,
            "elevation_m": 440.0,
            "historical_events": 8,
            "affected_villages": ["Chimpu", "Nirjuli", "Doimukh"],
            "affected_roads": ["NH-415", "Itanagar–Jote Road"],
            "risk_factors": ["forecast rainfall", "river erosion", "weathered slopes"],
        },
    },
]


async def seed_demo_data(session: AsyncSession) -> None:
    """Insert prepared records only when their stable IDs are absent."""
    source_rows: dict[str, DataSource] = {}
    for descriptor in source_catalogue():
        source = await session.scalar(select(DataSource).where(DataSource.slug == descriptor.slug))
        if source is None:
            source = DataSource(
                slug=descriptor.slug,
                name=descriptor.name,
                category=descriptor.category,
                provider=descriptor.provider,
                access_type=descriptor.access_type,
                provenance=descriptor.provenance,
                status=descriptor.status,
                license_name=descriptor.license_name,
                attribution=descriptor.attribution,
                credential_env=descriptor.credential_env,
                metadata_json={"notes": descriptor.notes} if descriptor.notes else {},
            )
            session.add(source)
        source_rows[descriptor.slug] = source
    await session.flush()

    zone_rows: list[RiskZone] = []
    for payload in ZONES:
        zone = await session.scalar(select(RiskZone).where(RiskZone.zone_id == payload["zone_id"]))
        if zone is None:
            zone = RiskZone(
                **payload,
                provenance=Provenance.PREPARED_DEMO,
                last_observed_at=NOW,
            )
            session.add(zone)
        zone_rows.append(zone)
    await session.flush()

    if await session.scalar(select(RiskPrediction.id).limit(1)) is None:
        for zone in zone_rows:
            prediction = RiskPrediction(
                zone_id=zone.id,
                score=zone.risk_score,
                level=zone.risk_level,
                confidence=zone.confidence,
                model_name="transparent-weighted-risk",
                model_version="demo-1.0",
                predicted_at=NOW,
                valid_until=NOW + timedelta(hours=6),
                missing_features=["physical_sensor_observation"],
                provenance=Provenance.PREPARED_DEMO,
            )
            session.add(prediction)
            await session.flush()
            metadata = zone.metadata_json
            contributions = [
                ("susceptibility", 0.78, 0.26),
                ("rainfall_24h", min(metadata["rainfall_mm"] / 250, 1), 0.16),
                ("soil_moisture", metadata["soil_moisture"] / 100, 0.10),
                ("slope", min(metadata["slope_deg"] / 45, 1), 0.12),
                ("prepared_satellite_change", 0.55, 0.08),
            ]
            for feature, normalized, weight in contributions:
                session.add(RiskContribution(
                    prediction_id=prediction.id,
                    feature_name=feature,
                    raw_value=normalized,
                    normalized_value=normalized,
                    weight=weight,
                    contribution=normalized * weight * 100,
                    source_id=source_rows["open-meteo"].id if "rainfall" in feature else None,
                    observed_at=NOW,
                    provenance=Provenance.PREPARED_DEMO,
                ))

    if await session.scalar(select(SatelliteScene.id).limit(1)) is None:
        scene = SatelliteScene(
            source_id=source_rows["cdse-stac"].id,
            external_id="prepared-sentinel-1-demo-20260908",
            platform="Sentinel-1",
            product_type="prepared_backscatter_change",
            acquired_at=NOW - timedelta(days=1),
            footprint=None,
            cloud_cover=None,
            catalogue_url=None,
            metadata_json={
                "classification": "prepared_demo",
                "warning": "Not a live Sentinel scene or operational SAR analysis",
            },
        )
        session.add(scene)
        await session.flush()
        session.add(SatelliteEvidence(
            zone_id=zone_rows[0].id,
            scene_id=scene.id,
            evidence_type="prepared_backscatter_change",
            value=0.55,
            confidence=0.62,
            observed_at=NOW - timedelta(days=1),
            provenance=Provenance.PREPARED_DEMO,
            notes="Deterministic prepared evidence for offline demonstration only.",
        ))

    if await session.scalar(select(InfrastructureAsset.id).limit(1)) is None:
        for zone in zone_rows:
            for index, road in enumerate(zone.metadata_json["affected_roads"]):
                session.add(InfrastructureAsset(
                    source_id=source_rows["openstreetmap"].id,
                    external_id=f"prepared-road-{zone.zone_id}-{index}",
                    zone_id=zone.id,
                    asset_type="road",
                    name=road,
                    geometry=None,
                    operational_status="warning" if zone.risk_level in {"HIGH", "CRITICAL"} else "open",
                    criticality=0.8 if index == 0 else 0.55,
                    provenance=Provenance.PREPARED_DEMO,
                    metadata_json={"classification": "prepared_demo"},
                ))

    if await session.scalar(select(FieldReport.id).limit(1)) is None:
        pending = FieldReport(
            public_id="FR-DEMO-001",
            zone_id=zone_rows[2].id,
            reporter_id="prepared-field-officer",
            reporter_type="FIELD_AGENT",
            report_type="SOIL_CRACK",
            description="Prepared demonstration report of widening cracks near a road cut.",
            urgency="HIGH",
            status="pending",
            observed_at=NOW - timedelta(hours=2),
            location=None,
            provenance=Provenance.PREPARED_DEMO,
        )
        verified = FieldReport(
            public_id="FR-DEMO-002",
            zone_id=zone_rows[0].id,
            reporter_id="prepared-field-officer",
            reporter_type="FIELD_AGENT",
            report_type="WATER_SEEPAGE",
            description="Prepared demonstration report reviewed by an authority role.",
            urgency="HIGH",
            status="verified",
            observed_at=NOW - timedelta(hours=3),
            location=None,
            provenance=Provenance.PREPARED_DEMO,
        )
        session.add_all([pending, verified])
        await session.flush()
        session.add(ReportReview(
            report_id=verified.id,
            reviewer_id="prepared-authority",
            decision="accepted",
            severity=0.7,
            notes="Prepared human-review record for offline demonstration.",
            reviewed_at=NOW - timedelta(hours=2, minutes=30),
        ))

    if await session.scalar(select(Alert.id).limit(1)) is None:
        alert = Alert(
            public_id="ALERT-DEMO-001",
            zone_id=zone_rows[0].id,
            severity="CRITICAL",
            title="Prepared corridor risk alert",
            description="Simulation-only alert generated from prepared demonstration data.",
            status="approved_simulation",
            evacuation_recommended=True,
            created_by="prepared-authority",
        )
        session.add(alert)
        await session.flush()
        session.add(AlertEvent(
            alert_id=alert.id,
            event_type="approved_simulation",
            actor_id="prepared-authority",
            occurred_at=NOW,
            notes="No SMS, cell broadcast, email or public notification was sent.",
            metadata_json={"dispatch": "disabled"},
        ))

    await session.commit()
