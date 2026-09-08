"""Auditable ingestion orchestration and raw-asset persistence."""
from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select

from backend.api.config import settings
from backend.api.database.models import DataSource, IngestionRun, RawAsset
from backend.api.database.session import get_session_factory
from backend.api.integrations.base import AreaOfInterest, SourceAdapter


class IngestionService:
    def __init__(self) -> None:
        self._session_factory = get_session_factory()

    async def run(self, adapter: SourceAdapter, aoi: AreaOfInterest, **kwargs):
        started_at = datetime.now(timezone.utc)
        async with self._session_factory.begin() as session:
            source = await session.scalar(select(DataSource).where(DataSource.slug == adapter.descriptor.slug))
            if source is None:
                raise ValueError(f"Unknown source {adapter.descriptor.slug}")
            run = IngestionRun(source_id=source.id, status="running", started_at=started_at)
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
                if batch.raw_payload is not None:
                    directory = Path(settings.object_storage_path) / source.slug
                    directory.mkdir(parents=True, exist_ok=True)
                    path = directory / f"{checksum}.json"
                    if not path.exists():
                        path.write_bytes(batch.raw_payload)
                    asset_uri = str(path)
                    existing = await session.scalar(select(RawAsset).where(RawAsset.source_id == source.id, RawAsset.checksum == checksum))
                    if existing is None:
                        session.add(RawAsset(source_id=source.id, ingestion_run_id=run.id, uri=asset_uri, media_type=batch.media_type, checksum=checksum, size_bytes=len(batch.raw_payload), metadata_json={"source_version": batch.source_version}))
                run.status = "succeeded"
                run.finished_at = datetime.now(timezone.utc)
                run.source_version = batch.source_version
                run.coverage_start = batch.coverage_start
                run.coverage_end = batch.coverage_end
                run.records_read = len(batch.records)
                run.records_written = len(batch.records)
                run.quality_flags = batch.quality_flags
                source.last_success_at = run.finished_at
                source.last_error = None
                return {"run_id": run.id, "status": run.status, "records": len(batch.records), "asset_uri": asset_uri, "quality_flags": batch.quality_flags}
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
