"""Auditable ingestion orchestration and raw-asset persistence."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import func, select
from sqlalchemy.dialects.sqlite import insert as sqlite_insert
from sqlalchemy.dialects.postgresql import insert as postgres_insert

from backend.api.config import settings
from backend.api.database.base import Provenance
from backend.api.database.models import (
    DataSource,
    IngestionRun,
    Observation,
    RawAsset,
    SatelliteScene,
    SoilMoistureObservation,
    WeatherObservation,
)
from backend.api.database.session import get_session_factory
from backend.api.integrations.base import AreaOfInterest, SourceAdapter


class IngestionService:
    def __init__(self) -> None:
        self._session_factory = get_session_factory()

    @staticmethod
    def _insert_for(session, model, values: dict, conflict_columns: list[str]):
        dialect = session.bind.dialect.name
        if dialect == "postgresql":
            return postgres_insert(model).values(**values).on_conflict_do_nothing(index_elements=conflict_columns)
        if dialect == "sqlite":
            return sqlite_insert(model).values(**values).on_conflict_do_nothing(index_elements=conflict_columns)
        return None

    async def _persist_records(self, session, source: DataSource, batch, raw_asset_id: int | None) -> int:
        written = 0
        if source.slug == "open-meteo":
            for record in batch.records:
                provenance = Provenance(record["provenance"])
                common = {
                    "source_id": source.id,
                    "zone_id": None,
                    "value": record.get("value"),
                    "unit": record.get("unit", "unknown"),
                    "observed_at": record["observed_at"],
                    "provenance": provenance,
                    "quality_flags": record.get("quality_flags", []),
                }
                if record["domain"] == "weather":
                    existing = await session.scalar(
                        select(WeatherObservation.id).where(
                            WeatherObservation.source_id == source.id,
                            WeatherObservation.zone_id.is_(None),
                            WeatherObservation.variable == record["variable"],
                            WeatherObservation.observed_at == record["observed_at"],
                        )
                    )
                    if existing is not None:
                        continue
                    values = {**common, "variable": record["variable"], "valid_at": record["observed_at"]}
                    model = WeatherObservation
                else:
                    depth_cm = 3.5 if record["variable"] == "soil_moisture_surface" else 17.5
                    existing = await session.scalar(
                        select(SoilMoistureObservation.id).where(
                            SoilMoistureObservation.source_id == source.id,
                            SoilMoistureObservation.zone_id.is_(None),
                            SoilMoistureObservation.depth_cm == depth_cm,
                            SoilMoistureObservation.observed_at == record["observed_at"],
                        )
                    )
                    if existing is not None:
                        continue
                    values = {**common, "depth_cm": depth_cm}
                    model = SoilMoistureObservation
                session.add(model(**values))
                written += 1
        elif source.slug == "cdse-stac":
            for record in batch.records:
                external_id = record.get("external_id")
                acquired_at = record.get("acquired_at")
                if not external_id or not acquired_at:
                    continue
                collection = record.get("collection") or "unknown"
                geometry = record.get("geometry")
                footprint = None
                if geometry:
                    footprint = (
                        func.ST_SetSRID(func.ST_GeomFromGeoJSON(json.dumps(geometry)), 4326)
                        if session.bind.dialect.name == "postgresql"
                        else json.dumps(geometry)
                    )
                values = {
                    "source_id": source.id,
                    "external_id": external_id,
                    "platform": "Sentinel-1" if "sentinel-1" in collection else "Sentinel-2" if "sentinel-2" in collection else collection,
                    "product_type": collection,
                    "acquired_at": acquired_at,
                    "footprint": footprint,
                    "cloud_cover": record.get("cloud_cover"),
                    "catalogue_url": record.get("catalogue_url"),
                    "raw_asset_id": raw_asset_id,
                    "metadata_json": {
                        "catalogue_metadata_only": True,
                        "not_processed_evidence": True,
                        "properties": record.get("metadata", {}),
                    },
                }
                statement = self._insert_for(session, SatelliteScene, values, ["source_id", "external_id"])
                if statement is not None:
                    result = await session.execute(statement)
                    written += max(result.rowcount or 0, 0)
                else:
                    session.add(SatelliteScene(**values))
                    written += 1
        else:
            for index, record in enumerate(batch.records):
                observed_at = record.get("observed_at") or record.get("acquired_at")
                if observed_at is None:
                    continue
                values = {
                    "source_id": source.id,
                    "zone_id": None,
                    "external_id": record.get("external_id") or f"{source.slug}-{index}",
                    "domain": record.get("domain", source.category),
                    "variable": record.get("variable", "value"),
                    "value": record.get("value"),
                    "unit": record.get("unit", "unknown"),
                    "observed_at": observed_at,
                    "valid_at": record.get("valid_at"),
                    "provenance": Provenance(record.get("provenance", source.provenance.value)),
                    "quality_flags": record.get("quality_flags", []),
                    "metadata_json": record.get("metadata", {}),
                }
                statement = self._insert_for(
                    session,
                    Observation,
                    values,
                    ["source_id", "external_id", "variable", "observed_at"],
                )
                if statement is not None:
                    result = await session.execute(statement)
                    written += max(result.rowcount or 0, 0)
                else:
                    session.add(Observation(**values))
                    written += 1
        return written

    async def run(
        self,
        adapter: SourceAdapter,
        aoi: AreaOfInterest,
        *,
        audit_context: dict | None = None,
        **kwargs,
    ):
        started_at = datetime.now(timezone.utc)
        audit_context = audit_context or {}
        async with self._session_factory.begin() as session:
            source = await session.scalar(select(DataSource).where(DataSource.slug == adapter.descriptor.slug))
            if source is None:
                source = DataSource(
                    slug=adapter.descriptor.slug,
                    name=adapter.descriptor.name,
                    category=adapter.descriptor.category,
                    provider=adapter.descriptor.provider,
                    access_type=adapter.descriptor.access_type,
                    provenance=adapter.descriptor.provenance,
                    status=adapter.descriptor.status,
                    license_name=adapter.descriptor.license_name,
                    attribution=adapter.descriptor.attribution,
                    credential_env=adapter.descriptor.credential_env,
                    metadata_json={"notes": adapter.descriptor.notes} if adapter.descriptor.notes else {},
                )
                session.add(source)
                await session.flush()
            run = IngestionRun(
                source_id=source.id,
                status="running",
                started_at=started_at,
                aoi_wkt=(
                    f"POLYGON(({aoi.west} {aoi.south},{aoi.east} {aoi.south},"
                    f"{aoi.east} {aoi.north},{aoi.west} {aoi.north},{aoi.west} {aoi.south}))"
                ),
                ingestion_method=audit_context.get("ingestion_method"),
                initiated_by=audit_context.get("initiated_by"),
                initiator_role=audit_context.get("initiator_role"),
                authorization_reference=audit_context.get("authorization_reference"),
                license_reference=audit_context.get("license_reference"),
                original_filename=audit_context.get("original_filename"),
                media_type=audit_context.get("media_type"),
            )
            session.add(run)
            await session.flush()
            run_id = run.id

        try:
            batch = await adapter.fetch(aoi, **kwargs)
            checksum = hashlib.sha256(batch.raw_payload or b"").hexdigest()
            async with self._session_factory.begin() as session:
                run = await session.get(IngestionRun, run_id)
                assert run is not None
                source = await session.get(DataSource, run.source_id)
                assert source is not None
                asset_uri = None
                raw_asset_id = None
                if batch.raw_payload is not None:
                    directory = Path(settings.object_storage_path) / source.slug
                    directory.mkdir(parents=True, exist_ok=True)
                    suffixes = {
                        "application/json": ".json",
                        "application/geo+json": ".geojson",
                        "text/csv": ".csv",
                        "image/tiff": ".tif",
                        "application/x-netcdf": ".nc",
                        "application/x-hdf5": ".h5",
                        "application/x-hdf": ".hdf",
                        "application/zip": ".zip",
                        "application/x-zip-compressed": ".zip",
                    }
                    suffix = suffixes.get(batch.media_type, ".bin")
                    path = directory / f"{checksum}{suffix}"
                    if not path.exists():
                        path.write_bytes(batch.raw_payload)
                    asset_uri = str(path)
                    existing = await session.scalar(select(RawAsset).where(RawAsset.source_id == source.id, RawAsset.checksum == checksum))
                    if existing is None:
                        asset = RawAsset(source_id=source.id, ingestion_run_id=run.id, uri=asset_uri, media_type=batch.media_type, checksum=checksum, size_bytes=len(batch.raw_payload), metadata_json={"source_version": batch.source_version})
                        session.add(asset)
                        await session.flush()
                        raw_asset_id = asset.id
                    else:
                        raw_asset_id = existing.id
                records_written = await self._persist_records(session, source, batch, raw_asset_id)
                run.status = "succeeded"
                run.finished_at = datetime.now(timezone.utc)
                run.source_version = batch.source_version
                run.coverage_start = batch.coverage_start
                run.coverage_end = batch.coverage_end
                run.records_read = len(batch.records)
                run.records_written = records_written
                run.quality_flags = batch.quality_flags
                run.checksum = checksum if batch.raw_payload is not None else None
                run.media_type = batch.media_type
                source.last_success_at = run.finished_at
                source.last_error = None
                return {
                    "run_id": run.id,
                    "status": run.status,
                    "records_read": len(batch.records),
                    "records_written": records_written,
                    "checksum": checksum if batch.raw_payload is not None else None,
                    "quality_flags": batch.quality_flags,
                }
        except Exception as exc:
            async with self._session_factory.begin() as session:
                run = await session.get(IngestionRun, run_id)
                assert run is not None
                source = await session.get(DataSource, run.source_id)
                run.status = "failed"
                run.finished_at = datetime.now(timezone.utc)
                run.error = str(exc)
                if source:
                    source.last_error = str(exc)
            raise
