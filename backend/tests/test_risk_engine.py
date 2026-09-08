"""Tests for transparent risk calculation and safety boundaries."""
from datetime import datetime, timezone

from backend.api.services.risk_engine import FeatureValue, calculate_risk


def feature(value: float | None) -> FeatureValue:
    return FeatureValue(value, "test", datetime.now(timezone.utc), "live_modelled")


def test_missing_values_are_not_treated_as_zero():
    result = calculate_risk({"rainfall_24h": feature(180)})
    assert result.score is None
    assert result.level == "UNAVAILABLE"
    assert "soil_moisture" in result.missing_features


def test_complete_features_return_ordered_contributions():
    values = {
        "susceptibility": feature(0.8),
        "rainfall_24h": feature(200),
        "rainfall_72h": feature(350),
        "forecast_24h": feature(120),
        "soil_moisture": feature(75),
        "slope": feature(35),
        "satellite_change": feature(0.6),
        "verified_field_evidence": feature(0.7),
    }
    result = calculate_risk(values)
    assert result.score is not None
    assert [item.feature for item in result.contributions] == list(values)
    assert result.confidence == 1.0
