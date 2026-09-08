"""Canonical capabilities for restricted institutional data providers."""
from __future__ import annotations

from dataclasses import dataclass

from backend.api.config import settings
from backend.api.database.base import Provenance
from backend.api.integrations.base import SourceDescriptor


@dataclass(frozen=True)
class InstitutionalSource:
    slug: str
    name: str
    category: str
    provider: str
    credential_env: str
    accepted_extensions: tuple[str, ...]
    accepted_media_types: tuple[str, ...]
    guidance: str

    def credentials_configured(self) -> bool:
        endpoint, credential = institutional_configuration(self.slug)
        return bool(endpoint and credential)

    def descriptor(self) -> SourceDescriptor:
        return SourceDescriptor(
            slug=self.slug,
            name=self.name,
            category=self.category,
            provider=self.provider,
            access_type="institutional",
            provenance=Provenance.UNAVAILABLE,
            status="provider_contract_required" if self.credentials_configured() else "authorization_required",
            credential_env=self.credential_env,
            notes=self.guidance,
        )

    def public_capabilities(self) -> dict:
        return {
            "credential_configured": self.credentials_configured(),
            "file_import_available": True,
            "provider_adapter_status": "provider_contract_required",
            "accepted_formats": list(self.accepted_extensions),
            "authorization_required": True,
            "operator_guidance": self.guidance,
        }


INSTITUTIONAL_SOURCES: dict[str, InstitutionalSource] = {
    "imd": InstitutionalSource(
        "imd", "India Meteorological Department", "weather", "IMD", "IMD_API_KEY",
        (".csv", ".json", ".geojson", ".nc", ".h5", ".hdf"),
        ("text/csv", "application/json", "application/geo+json", "application/x-netcdf", "application/x-hdf5", "application/x-hdf"),
        "Import an authorized IMD export. Live access requires an approved IMD API contract.",
    ),
    "gsi": InstitutionalSource(
        "gsi", "GSI Bhusanket / NLSM", "geology_landslides", "Geological Survey of India", "GSI_API_KEY",
        (".csv", ".json", ".geojson", ".tif", ".tiff", ".zip"),
        ("text/csv", "application/json", "application/geo+json", "image/tiff", "application/zip", "application/x-zip-compressed"),
        "Import an authorized GSI inventory or susceptibility product; retain its licence and uncertainty.",
    ),
    "india-wris": InstitutionalSource(
        "india-wris", "CWC / India-WRIS", "hydrology", "Central Water Commission", "INDIA_WRIS_API_KEY",
        (".csv", ".json", ".geojson", ".nc", ".zip"),
        ("text/csv", "application/json", "application/geo+json", "application/x-netcdf", "application/zip", "application/x-zip-compressed"),
        "Import an authorized CWC or India-WRIS hydrology export with station and coverage metadata.",
    ),
    "bhuvan": InstitutionalSource(
        "bhuvan", "NRSC Bhuvan / Bhoonidhi", "satellite_terrain", "NRSC", "BHUVAN_API_KEY",
        (".tif", ".tiff", ".json", ".geojson", ".zip", ".h5", ".hdf"),
        ("image/tiff", "application/json", "application/geo+json", "application/zip", "application/x-zip-compressed", "application/x-hdf5", "application/x-hdf"),
        "Import an authorized Bhuvan or Bhoonidhi product; imagery processing remains a background job.",
    ),
    "mosdac": InstitutionalSource(
        "mosdac", "MOSDAC", "satellite_weather", "SAC/ISRO", "MOSDAC_API_KEY",
        (".tif", ".tiff", ".nc", ".h5", ".hdf", ".json", ".zip"),
        ("image/tiff", "application/x-netcdf", "application/x-hdf5", "application/x-hdf", "application/json", "application/zip", "application/x-zip-compressed"),
        "Import an authorized MOSDAC satellite-weather product with provider terms and source version.",
    ),
}


def institutional_configuration(slug: str) -> tuple[str | None, str | None]:
    return {
        "imd": (settings.imd_api_url, settings.imd_api_key),
        "gsi": (settings.gsi_api_url, settings.gsi_api_key),
        "india-wris": (settings.india_wris_api_url, settings.india_wris_api_key),
        "bhuvan": (settings.bhuvan_api_url, settings.bhuvan_api_key),
        "mosdac": (settings.mosdac_api_url, settings.mosdac_api_key),
    }[slug]
