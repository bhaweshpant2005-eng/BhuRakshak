"""Tests for public and restricted adapter behavior."""
from pathlib import Path

import pytest
from fastapi import HTTPException
from starlette.datastructures import Headers, UploadFile

from backend.api.database.base import Provenance
from backend.api.integrations.base import AreaOfInterest, SourceDescriptor, SourceNotConfigured
from backend.api.integrations.file_import import FileImportAdapter
from backend.api.integrations.institutional import INSTITUTIONAL_SOURCES
from backend.api.integrations.open_meteo import OpenMeteoAdapter
from backend.api.integrations.restricted import RestrictedConnector
from backend.api.services.source_imports import safe_filename, stage_upload


def test_open_meteo_normalization_retains_missing_values():
    records = OpenMeteoAdapter._normalize({
        "hourly": {"time": ["2026-09-09T00:00"], "precipitation": [None]},
        "hourly_units": {"precipitation": "mm"},
    })
    rainfall = next(record for record in records if record["variable"] == "rainfall_hourly")
    assert rainfall["value"] is None
    assert rainfall["quality_flags"] == ["missing_value"]
    assert rainfall["provenance"] == "live_modelled"


@pytest.mark.asyncio
async def test_restricted_connector_never_calls_an_unconfigured_source():
    connector = RestrictedConnector(
        SourceDescriptor("imd", "IMD", "weather", "IMD", "institutional", Provenance.UNAVAILABLE, "authorization_required"),
        endpoint=None,
        credential=None,
    )
    with pytest.raises(SourceNotConfigured, match="authorized endpoint"):
        await connector.fetch(AreaOfInterest(90, 22, 95, 28))


def test_all_institutional_sources_offer_file_import_without_live_adapter():
    assert set(INSTITUTIONAL_SOURCES) == {"imd", "gsi", "india-wris", "bhuvan", "mosdac"}
    for source in INSTITUTIONAL_SOURCES.values():
        capabilities = source.public_capabilities()
        assert capabilities["file_import_available"] is True
        assert capabilities["provider_adapter_status"] == "provider_contract_required"
        assert capabilities["authorization_required"] is True
        assert capabilities["accepted_formats"]


def test_path_like_upload_filename_is_rejected():
    with pytest.raises(HTTPException, match="Filename must not contain a path"):
        safe_filename("../government-data.csv")


@pytest.mark.asyncio
async def test_empty_authorized_upload_is_rejected(tmp_path, monkeypatch):
    from backend.api.services import source_imports

    monkeypatch.setattr(source_imports.settings, "object_storage_path", tmp_path)
    upload = UploadFile(filename="weather.csv", file=Path(tmp_path / "empty").open("w+b"), headers=Headers({"content-type": "text/csv"}))
    with pytest.raises(HTTPException, match="empty"):
        await stage_upload("imd", upload)


@pytest.mark.asyncio
async def test_restricted_file_adapter_requires_authorization_reference(tmp_path):
    path = tmp_path / "weather.csv"
    path.write_text("time,rainfall\n2026-09-09T00:00:00Z,5\n")
    adapter = FileImportAdapter("imd", path, {"source_version": "test"})
    with pytest.raises(PermissionError, match="authorization_reference"):
        await adapter.fetch(AreaOfInterest(88, 22, 98, 30))
