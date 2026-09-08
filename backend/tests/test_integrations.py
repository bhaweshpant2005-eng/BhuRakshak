"""Tests for public and restricted adapter behavior."""
import pytest

from backend.api.database.base import Provenance
from backend.api.integrations.base import AreaOfInterest, SourceDescriptor, SourceNotConfigured
from backend.api.integrations.open_meteo import OpenMeteoAdapter
from backend.api.integrations.restricted import RestrictedConnector


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
