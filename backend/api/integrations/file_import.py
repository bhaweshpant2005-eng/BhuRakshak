"""Safe file-import adapters for externally downloaded geospatial datasets."""
from __future__ import annotations

import hashlib
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from backend.api.database.base import Provenance
from backend.api.integrations.base import AreaOfInterest, IngestionBatch, SourceAdapter, SourceDescriptor

IMPORT_SOURCES: dict[str, SourceDescriptor] = {
    "gpm-imerg": SourceDescriptor("gpm-imerg", "GPM IMERG", "rainfall", "NASA Earthdata", "file_import", Provenance.CACHED_MODELLED, "import_available"),
    "smap": SourceDescriptor("smap", "SMAP Soil Moisture", "soil", "NASA Earthdata", "file_import", Provenance.CACHED_OBSERVED, "import_available"),
    "era5-land": SourceDescriptor("era5-land", "ERA5-Land", "weather_soil", "Copernicus Climate Data Store", "file_import", Provenance.CACHED_MODELLED, "import_available"),
    "hydrosheds": SourceDescriptor("hydrosheds", "HydroSHEDS", "hydrology", "HydroSHEDS", "file_import", Provenance.STATIC_REFERENCE, "import_available"),
    "worldpop": SourceDescriptor("worldpop", "WorldPop", "population", "WorldPop", "file_import", Provenance.STATIC_REFERENCE, "import_available"),
    "nasa-coolr": SourceDescriptor("nasa-coolr", "NASA COOLR", "landslides", "NASA", "file_import", Provenance.STATIC_REFERENCE, "import_available"),
    "imd": SourceDescriptor("imd", "India Meteorological Department", "weather", "IMD", "authorized_file_import", Provenance.CACHED_OBSERVED, "import_available"),
    "gsi": SourceDescriptor("gsi", "GSI Bhusanket / NLSM", "geology_landslides", "GSI", "authorized_file_import", Provenance.CACHED_OBSERVED, "import_available"),
    "india-wris": SourceDescriptor("india-wris", "CWC / India-WRIS", "hydrology", "CWC", "authorized_file_import", Provenance.CACHED_OBSERVED, "import_available"),
    "bhuvan": SourceDescriptor("bhuvan", "NRSC Bhuvan / Bhoonidhi", "satellite_terrain", "NRSC", "authorized_file_import", Provenance.CACHED_OBSERVED, "import_available"),
    "mosdac": SourceDescriptor("mosdac", "MOSDAC", "satellite_weather", "SAC/ISRO", "authorized_file_import", Provenance.CACHED_OBSERVED, "import_available"),
}


class FileImportAdapter(SourceAdapter):
    """Register an operator-supplied file without scraping or guessing APIs."""

    def __init__(self, source_slug: str, path: Path, metadata: dict[str, Any] | None = None):
        if source_slug not in IMPORT_SOURCES:
            raise ValueError(f"Unsupported file-import source: {source_slug}")
        self.descriptor = IMPORT_SOURCES[source_slug]
        self.path = path.resolve()
        self.metadata = metadata or {}

    async def fetch(self, aoi: AreaOfInterest, **kwargs: Any) -> IngestionBatch:
        if not self.path.is_file():
            raise FileNotFoundError(self.path)
        if self.descriptor.access_type == "authorized_file_import" and not self.metadata.get("authorization_reference"):
            raise PermissionError(
                "Restricted-source imports require metadata.authorization_reference from the authorized provider or agreement"
            )
        observed_at = kwargs.get("observed_at") or datetime.fromtimestamp(
            self.path.stat().st_mtime, tz=timezone.utc
        )
        payload = self.path.read_bytes()
        checksum = hashlib.sha256(payload).hexdigest()
        record = {
            "external_id": self.metadata.get("external_id", checksum),
            "domain": self.descriptor.category,
            "variable": self.metadata.get("variable", "imported_asset"),
            "value": self.metadata.get("value"),
            "unit": self.metadata.get("unit", "unknown"),
            "observed_at": observed_at,
            "provenance": self.descriptor.provenance.value,
            "quality_flags": self.metadata.get("quality_flags", ["operator_supplied_file"]),
            "metadata": {
                **self.metadata,
                "original_filename": self.path.name,
                "aoi_bbox": aoi.as_bbox(),
                "source_file_checksum": checksum,
            },
        }
        suffix = self.path.suffix.lower()
        media_type = {
            ".tif": "image/tiff",
            ".tiff": "image/tiff",
            ".json": "application/json",
            ".geojson": "application/geo+json",
            ".csv": "text/csv",
            ".nc": "application/x-netcdf",
            ".h5": "application/x-hdf5",
            ".hdf": "application/x-hdf",
        }.get(suffix, "application/octet-stream")
        return IngestionBatch(
            source_slug=self.descriptor.slug,
            source_version=str(self.metadata.get("source_version", "operator-import")),
            coverage_start=observed_at,
            coverage_end=observed_at,
            records=[record],
            raw_payload=payload,
            media_type=media_type,
            quality_flags=["operator_supplied_file"],
        )


def load_metadata(path: Path | None) -> dict[str, Any]:
    if path is None:
        return {}
    value = json.loads(path.read_text())
    if not isinstance(value, dict):
        raise ValueError("Metadata JSON must contain an object")
    return value
