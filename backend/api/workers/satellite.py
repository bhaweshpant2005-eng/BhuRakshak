"""Background satellite change processing and evidence persistence."""
from __future__ import annotations

import argparse
import asyncio
from datetime import datetime, timezone
from pathlib import Path

import numpy as np
import rasterio
from sqlalchemy import select

from backend.api.database import close_database, initialize_database
from backend.api.database.base import Provenance
from backend.api.database.models import ProcessingJob, RiskZone, SatelliteEvidence, SatelliteScene
from backend.api.database.session import get_session_factory

NODATA = -9999.0


def valid_band(dataset: rasterio.io.DatasetReader) -> tuple[np.ndarray, np.ndarray]:
    values = dataset.read(1).astype("float32")
    mask = dataset.read(2) > 0 if dataset.count >= 2 else dataset.dataset_mask() > 0
    mask &= np.isfinite(values) & (values != NODATA)
    return values, mask


def change_score(before_path: Path, after_path: Path, product: str) -> tuple[float | None, dict]:
    with rasterio.open(before_path) as before, rasterio.open(after_path) as after:
        if before.crs != after.crs or before.transform != after.transform or before.shape != after.shape:
            raise ValueError("Before and after rasters must share CRS, transform and dimensions")
        before_values, before_mask = valid_band(before)
        after_values, after_mask = valid_band(after)
    valid = before_mask & after_mask
    if not np.any(valid):
        return None, {"valid_pixels": 0, "reason": "no_overlapping_valid_pixels"}
    delta = after_values[valid] - before_values[valid]
    threshold = 1.5 if product == "sentinel-1-grd" else 0.12
    changed = np.abs(delta) >= threshold
    score = float(np.clip(np.mean(changed), 0, 1))
    return score, {
        "valid_pixels": int(valid.sum()),
        "changed_pixels": int(changed.sum()),
        "mean_delta": float(np.mean(delta)),
        "threshold": threshold,
        "metric": "vv_db_absolute_change_fraction" if product == "sentinel-1-grd" else "ndvi_absolute_change_fraction",
    }


async def persist_evidence(
    zone_public_id: str,
    scene_external_id: str,
    product: str,
    before: Path,
    after: Path,
) -> dict:
    score, metadata = change_score(before, after, product)
    factory = get_session_factory()
    async with factory.begin() as session:
        zone = await session.scalar(select(RiskZone).where(RiskZone.zone_id == zone_public_id))
        scene = await session.scalar(select(SatelliteScene).where(SatelliteScene.external_id == scene_external_id))
        if zone is None:
            raise ValueError("Zone not found")
        if scene is None:
            raise ValueError("Satellite scene not found; ingest catalogue metadata first")
        job = ProcessingJob(
            job_type="sentinel_change_detection",
            status="succeeded",
            parameters={"product": product, "before": str(before), "after": str(after), **metadata},
        )
        session.add(job)
        await session.flush()
        evidence = SatelliteEvidence(
            zone_id=zone.id,
            scene_id=scene.id,
            evidence_type="sentinel_1_backscatter_change" if product == "sentinel-1-grd" else "sentinel_2_ndvi_change",
            value=score,
            confidence=min(0.9, 0.5 + min(metadata["valid_pixels"] / 1_000_000, 0.4)) if score is not None else 0.0,
            observed_at=datetime.now(timezone.utc),
            provenance=Provenance.DERIVED,
            processing_job_id=job.id,
            notes="Automated change evidence requires human/geoscientific interpretation; it is not a landslide confirmation.",
        )
        session.add(evidence)
        await session.flush()
        return {"evidence_id": evidence.id, "value": score, "metadata": metadata}


def parser() -> argparse.ArgumentParser:
    value = argparse.ArgumentParser(description="Process downloaded Sentinel rasters outside FastAPI")
    value.add_argument("--zone", required=True)
    value.add_argument("--scene", required=True)
    value.add_argument("--product", required=True, choices=["sentinel-1-grd", "sentinel-2-l2a"])
    value.add_argument("--before", required=True, type=Path)
    value.add_argument("--after", required=True, type=Path)
    return value


async def run(args: argparse.Namespace) -> None:
    await initialize_database()
    try:
        print(await persist_evidence(args.zone, args.scene, args.product, args.before, args.after))
    finally:
        await close_database()


def main() -> None:
    asyncio.run(run(parser().parse_args()))


if __name__ == "__main__":
    main()
