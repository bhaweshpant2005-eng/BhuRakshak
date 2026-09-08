"""Transparent deterministic landslide risk scoring."""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime


WEIGHTS = {
    "susceptibility": 0.26,
    "rainfall_24h": 0.16,
    "rainfall_72h": 0.12,
    "forecast_24h": 0.08,
    "soil_moisture": 0.10,
    "slope": 0.12,
    "satellite_change": 0.08,
    "verified_field_evidence": 0.08,
}


@dataclass(frozen=True)
class FeatureValue:
    value: float | None
    source: str
    observed_at: datetime | None
    provenance: str


@dataclass(frozen=True)
class Contribution:
    feature: str
    raw_value: float | None
    normalized_value: float | None
    weight: float
    contribution: float | None
    source: str
    observed_at: datetime | None
    provenance: str


@dataclass(frozen=True)
class RiskResult:
    score: float | None
    level: str
    confidence: float
    contributions: list[Contribution]
    missing_features: list[str]


NORMALIZERS = {
    "susceptibility": lambda value: value,
    "rainfall_24h": lambda value: value / 250,
    "rainfall_72h": lambda value: value / 500,
    "forecast_24h": lambda value: value / 200,
    "soil_moisture": lambda value: value / 100,
    "slope": lambda value: value / 45,
    "satellite_change": lambda value: value,
    "verified_field_evidence": lambda value: value,
}


def risk_level(score: float | None) -> str:
    if score is None:
        return "UNAVAILABLE"
    if score >= 75:
        return "CRITICAL"
    if score >= 58:
        return "HIGH"
    if score >= 38:
        return "MODERATE"
    return "LOW"


def calculate_risk(features: dict[str, FeatureValue]) -> RiskResult:
    contributions: list[Contribution] = []
    missing: list[str] = []
    weighted_sum = 0.0
    available_weight = 0.0

    for name, weight in WEIGHTS.items():
        feature = features.get(name)
        if feature is None or feature.value is None:
            missing.append(name)
            contributions.append(Contribution(name, None, None, weight, None, feature.source if feature else "unavailable", feature.observed_at if feature else None, feature.provenance if feature else "unavailable"))
            continue
        normalized = min(max(NORMALIZERS[name](feature.value), 0), 1)
        contribution = normalized * weight
        weighted_sum += contribution
        available_weight += weight
        contributions.append(Contribution(name, feature.value, normalized, weight, contribution * 100, feature.source, feature.observed_at, feature.provenance))

    # Missing data is not converted to zero. A score is unavailable when less
    # than half the designed feature weight has evidence.
    score = round(weighted_sum / available_weight * 100, 2) if available_weight >= 0.5 else None
    confidence = round(available_weight * (1 - min(len(missing) * 0.03, 0.2)), 3)
    return RiskResult(score, risk_level(score), confidence, contributions, missing)
