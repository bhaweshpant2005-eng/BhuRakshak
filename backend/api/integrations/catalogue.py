"""Configured and intentionally-disabled source catalogue."""
from __future__ import annotations

from backend.api.config import settings
from backend.api.database.base import Provenance
from backend.api.integrations.base import SourceDescriptor


def _restricted_status(url: str | None, key: str | None) -> str:
    return "configured" if url and key else "authorization_required"


def source_catalogue() -> list[SourceDescriptor]:
    """Return source capability metadata without making network calls."""
    return [
        SourceDescriptor("open-meteo", "Open-Meteo Forecast", "weather_soil", "Open-Meteo", "public", Provenance.LIVE_MODELLED, "configured" if settings.open_meteo_enabled else "disabled", attribution="Weather forecasts by Open-Meteo"),
        SourceDescriptor("cdse-stac", "Copernicus Data Space Catalogue", "satellite", "European Union / ESA", "public_catalogue", Provenance.STATIC_REFERENCE, "configured", attribution="Contains modified Copernicus Sentinel data", notes="Catalogue discovery is not landslide analysis."),
        SourceDescriptor("cdse-process", "Copernicus Sentinel Hub Process API", "satellite", "European Union / ESA", "oauth_client", Provenance.CACHED_OBSERVED, "configured" if settings.cdse_client_id and settings.cdse_client_secret else "credentials_required", attribution="Contains modified Copernicus Sentinel data", credential_env="CDSE_CLIENT_ID / CDSE_CLIENT_SECRET", notes="Downloads bounded Sentinel rasters for worker processing; output is not automatically landslide evidence."),
        SourceDescriptor("openstreetmap", "OpenStreetMap", "infrastructure", "OpenStreetMap contributors", "public", Provenance.STATIC_REFERENCE, "configured", license_name="ODbL", attribution="© OpenStreetMap contributors"),
        SourceDescriptor("nasa-coolr", "NASA Cooperative Open Online Landslide Repository", "landslides", "NASA", "public_export", Provenance.STATIC_REFERENCE, "import_available", notes="Retain source uncertainty and event confidence."),
        SourceDescriptor("gpm-imerg", "GPM IMERG", "rainfall", "NASA Earthdata", "account_or_file_import", Provenance.CACHED_MODELLED, "configured" if settings.nasa_earthdata_token else "credentials_optional", credential_env="NASA_EARTHDATA_TOKEN"),
        SourceDescriptor("smap", "SMAP Soil Moisture", "soil", "NASA Earthdata", "account_or_file_import", Provenance.CACHED_OBSERVED, "configured" if settings.nasa_earthdata_token else "credentials_optional", credential_env="NASA_EARTHDATA_TOKEN"),
        SourceDescriptor("era5-land", "ERA5-Land", "weather_soil", "Copernicus Climate Data Store", "account_or_file_import", Provenance.CACHED_MODELLED, "configured" if settings.cds_api_key else "credentials_optional", credential_env="CDS_API_KEY"),
        SourceDescriptor("hydrosheds", "HydroSHEDS", "hydrology", "HydroSHEDS", "file_import", Provenance.STATIC_REFERENCE, "import_available"),
        SourceDescriptor("worldpop", "WorldPop", "population", "WorldPop", "file_import", Provenance.STATIC_REFERENCE, "import_available"),
        SourceDescriptor("imd", "India Meteorological Department", "weather", "IMD", "institutional", Provenance.UNAVAILABLE, _restricted_status(settings.imd_api_url, settings.imd_api_key), credential_env="IMD_API_KEY"),
        SourceDescriptor("gsi", "GSI Bhusanket / NLSM", "geology_landslides", "Geological Survey of India", "institutional", Provenance.UNAVAILABLE, _restricted_status(settings.gsi_api_url, settings.gsi_api_key), credential_env="GSI_API_KEY"),
        SourceDescriptor("india-wris", "CWC / India-WRIS", "hydrology", "Central Water Commission", "institutional", Provenance.UNAVAILABLE, _restricted_status(settings.india_wris_api_url, settings.india_wris_api_key), credential_env="INDIA_WRIS_API_KEY"),
        SourceDescriptor("bhuvan", "NRSC Bhuvan / Bhoonidhi", "satellite_terrain", "NRSC", "institutional", Provenance.UNAVAILABLE, _restricted_status(settings.bhuvan_api_url, settings.bhuvan_api_key), credential_env="BHUVAN_API_KEY"),
        SourceDescriptor("mosdac", "MOSDAC", "satellite_weather", "SAC/ISRO", "institutional", Provenance.UNAVAILABLE, _restricted_status(settings.mosdac_api_url, settings.mosdac_api_key), credential_env="MOSDAC_API_KEY"),
    ]
