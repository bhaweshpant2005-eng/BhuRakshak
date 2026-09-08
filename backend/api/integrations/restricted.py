"""Descriptors for restricted institutional connectors."""
from __future__ import annotations

from typing import Any

from backend.api.integrations.base import (
    AreaOfInterest,
    IngestionBatch,
    SourceAdapter,
    SourceDescriptor,
    SourceNotConfigured,
)


class RestrictedConnector(SourceAdapter):
    """Never guesses a private API shape or scrapes a restricted portal."""

    def __init__(self, descriptor: SourceDescriptor, endpoint: str | None, credential: str | None):
        self.descriptor = descriptor
        self.endpoint = endpoint
        self.credential = credential

    async def fetch(self, aoi: AreaOfInterest, **kwargs: Any) -> IngestionBatch:
        if not self.endpoint or not self.credential:
            raise SourceNotConfigured(
                f"{self.descriptor.name} requires an authorized endpoint and credential"
            )
        raise SourceNotConfigured(
            f"{self.descriptor.name} is configured but no provider-approved adapter contract is installed"
        )
