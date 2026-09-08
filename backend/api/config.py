"""Configuration management for the BhuRakshak backend."""
from pathlib import Path
from typing import List, Optional

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Configuration
    debug: bool = True
    api_version: str = "v1"
    api_prefix: str = "/api/v1"
    title: str = "BhuRakshak Landslide Risk API"
    description: str = "Explainable landslide monitoring and decision support for Northeast India"
    version: str = "1.1.0"

    # Persistence. SQLite keeps tests and explicit demo mode self-contained; the
    # operational local stack uses the PostGIS URL from .env/compose.yaml.
    database_url: str = "sqlite+aiosqlite:///./.data/bhurakshak.db"
    database_required: bool = False
    auto_create_schema: bool = True
    demo_mode: bool = True
    seed_demo_data: bool = True
    anonymous_demo_access: bool = True
    object_storage_path: Path = Path(".object-storage")
    object_storage_endpoint: Optional[str] = None
    object_storage_bucket: str = "bhurakshak-assets"
    object_storage_access_key: Optional[str] = None
    object_storage_secret_key: Optional[str] = None

    # Optional compatibility settings; the backend does not require Supabase.
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    supabase_service_role_key: Optional[str] = None

    # JWT Configuration
    secret_key: str = "change-this-local-development-key"
    algorithm: str = "HS256"

    # Public/open source adapters
    open_meteo_base_url: str = "https://api.open-meteo.com/v1"
    open_meteo_enabled: bool = True
    cdse_stac_url: str = "https://catalogue.dataspace.copernicus.eu/stac"
    cdse_client_id: Optional[str] = None
    cdse_client_secret: Optional[str] = None
    overpass_url: str = "https://overpass-api.de/api/interpreter"
    nasa_earthdata_token: Optional[str] = None
    cds_api_key: Optional[str] = None
    data_gov_in_api_key: Optional[str] = None
    openai_api_key: Optional[str] = None

    # Restricted institutional connectors. Descriptors remain disabled unless an
    # authorized endpoint and credential are supplied by the deploying authority.
    imd_api_url: Optional[str] = None
    imd_api_key: Optional[str] = None
    gsi_api_url: Optional[str] = None
    gsi_api_key: Optional[str] = None
    india_wris_api_url: Optional[str] = None
    india_wris_api_key: Optional[str] = None
    bhuvan_api_url: Optional[str] = None
    bhuvan_api_key: Optional[str] = None
    mosdac_api_url: Optional[str] = None
    mosdac_api_key: Optional[str] = None

    # ML Service Configuration
    ml_service_url: str = "http://localhost:8001"
    ml_service_timeout: int = 30

    # CORS Configuration
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
