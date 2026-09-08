"""Copernicus public STAC catalogue discovery adapter."""
from __future__ import annotations

import json
from datetime import datetime
from typing import Any

import httpx

from backend.api.config import settings
from backend.api.database.base import Provenance
from backend.api.integrations.base import AreaOfInterest, IngestionBatch, SourceAdapter, SourceDescriptor


class CopernicusStacAdapter(SourceAdapter):
    descriptor = SourceDescriptor(
        slug="cdse-stac",
        name="Copernicus Data Space Catalogue",
        category="satellite",
        provider="European Union / ESA",
        access_type="public_catalogue",
        provenance=Provenance.STATIC_REFERENCE,
        status="configured",
        attribution="Contains modified Copernicus Sentinel data",
        notes="Search results identify scenes; they are not landslide evidence.",
    )

    async def fetch(self, aoi: AreaOfInterest, **kwargs: Any) -> IngestionBatch:
        collections = kwargs.get("collections", ["sentinel-1-grd", "sentinel-2-l2a"])
        limit = min(int(kwargs.get("limit", 20)), 100)
        search = {
            "bbox": aoi.as_bbox(),
            "collections": collections,
            "limit": limit,
        }
        if kwargs.get("datetime"):
            search["datetime"] = kwargs["datetime"]
        async with httpx.AsyncClient(timeout=httpx.Timeout(20.0)) as client:
            response = await client.post(f"{settings.cdse_stac_url.rstrip('/')}/search", json=search)
            response.raise_for_status()
            payload = response.json()
        records = [self._normalize_feature(feature) for feature in payload.get("features", [])]
        acquired = [record["acquired_at"] for record in records if record["acquired_at"]]
        return IngestionBatch(
            source_slug=self.descriptor.slug,
            source_version=payload.get("context", {}).get("matched") and "stac-1.0",
            coverage_start=min(acquired) if acquired else None,
            coverage_end=max(acquired) if acquired else None,
            records=records,
            raw_payload=json.dumps(payload, separators=(",", ":")).encode(),
            quality_flags=["catalogue_metadata_only", "not_processed_evidence"],
        )

    @staticmethod
    def _normalize_feature(feature: dict[str, Any]) -> dict[str, Any]:
        properties = feature.get("properties", {})
        acquired = properties.get("datetime") or properties.get("start_datetime")
        return {
            "external_id": feature.get("id"),
            "collection": feature.get("collection"),
            "acquired_at": datetime.fromisoformat(acquired.replace("Z", "+00:00")) if acquired else None,
            "geometry": feature.get("geometry"),
            "cloud_cover": properties.get("eo:cloud_cover"),
            "catalogue_url": next(iter(feature.get("links", [])), {}).get("href"),
            "metadata": properties,
            "provenance": Provenance.STATIC_REFERENCE.value,
        }
