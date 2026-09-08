"""Validation and staging for authorized institutional source uploads."""
from __future__ import annotations

import re
from pathlib import Path

from fastapi import HTTPException, UploadFile, status

from backend.api.config import settings
from backend.api.integrations.institutional import INSTITUTIONAL_SOURCES

_CHUNK_SIZE = 1024 * 1024
_SAFE_NAME = re.compile(r"[^A-Za-z0-9._-]+")


def validate_aoi(west: float, south: float, east: float, north: float) -> None:
    if not (-180 <= west <= 180 and -180 <= east <= 180):
        raise HTTPException(status_code=422, detail="Longitude must be between -180 and 180")
    if not (-90 <= south <= 90 and -90 <= north <= 90):
        raise HTTPException(status_code=422, detail="Latitude must be between -90 and 90")
    if west >= east or south >= north:
        raise HTTPException(status_code=422, detail="AOI bounds must have west < east and south < north")


def safe_filename(filename: str | None) -> str:
    value = Path(filename or "import.bin").name
    cleaned = _SAFE_NAME.sub("_", value).strip("._")
    return cleaned[:180] or "import.bin"


def validate_upload(source_slug: str, filename: str, media_type: str | None) -> None:
    source = INSTITUTIONAL_SOURCES.get(source_slug)
    if source is None:
        raise HTTPException(status_code=404, detail="Unsupported institutional source")
    extension = Path(filename).suffix.lower()
    if extension not in source.accepted_extensions:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file type for {source.name}; accepted: {', '.join(source.accepted_extensions)}",
        )
    if media_type and media_type not in source.accepted_media_types and media_type != "application/octet-stream":
        raise HTTPException(status_code=415, detail=f"Unexpected media type for {source.name}: {media_type}")


async def stage_upload(source_slug: str, upload: UploadFile) -> Path:
    filename = safe_filename(upload.filename)
    validate_upload(source_slug, filename, upload.content_type)
    staging = Path(settings.object_storage_path) / ".staging" / source_slug
    staging.mkdir(parents=True, exist_ok=True)
    target = staging / filename
    counter = 1
    while target.exists():
        target = staging / f"{Path(filename).stem}-{counter}{Path(filename).suffix}"
        counter += 1

    size = 0
    try:
        with target.open("xb") as destination:
            while chunk := await upload.read(_CHUNK_SIZE):
                size += len(chunk)
                if size > settings.source_import_max_bytes:
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"Upload exceeds {settings.source_import_max_bytes} bytes",
                    )
                destination.write(chunk)
        if size == 0:
            raise HTTPException(status_code=422, detail="Uploaded file is empty")
        return target
    except Exception:
        target.unlink(missing_ok=True)
        raise
    finally:
        await upload.close()
