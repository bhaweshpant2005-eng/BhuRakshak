"""Shared contracts for external data-source adapters."""
from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from backend.api.database.base import Provenance


@dataclass(frozen=True)
class AreaOfInterest:
    west: float
    south: float
    east: float
    north: float

    def as_bbox(self) -> list[float]:
        return [self.west, self.south, self.east, self.north]


@dataclass(frozen=True)
class SourceDescriptor:
    slug: str
    name: str
    category: str
    provider: str
    access_type: str
    provenance: Provenance
    status: str
    license_name: str | None = None
    attribution: str | None = None
    credential_env: str | None = None
    notes: str | None = None


@dataclass
class IngestionBatch:
    source_slug: str
    source_version: str | None
    coverage_start: datetime | None
    coverage_end: datetime | None
    records: list[dict[str, Any]] = field(default_factory=list)
    raw_payload: bytes | None = None
    media_type: str = "application/json"
    quality_flags: list[str] = field(default_factory=list)


class SourceAdapter(ABC):
    descriptor: SourceDescriptor

    @abstractmethod
    async def fetch(self, aoi: AreaOfInterest, **kwargs: Any) -> IngestionBatch:
        """Fetch and normalize one bounded source batch."""


class SourceNotConfigured(RuntimeError):
    """Raised when an institutional connector has no authorized configuration."""
