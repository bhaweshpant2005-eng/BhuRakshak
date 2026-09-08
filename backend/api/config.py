"""Configuration management for NER-SENTRY backend."""
from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Configuration
    debug: bool = True
    api_version: str = "v1"
    api_prefix: str = "/api/v1"
    title: str = "NER-SENTRY Landslide Risk API"
    description: str = "AI-Based Landslide Risk Prediction, Early Warning & Decision Support Platform"
    version: str = "1.0.0"

    # Supabase Configuration
    supabase_url: str
    supabase_key: str
    supabase_service_role_key: str

    # JWT Configuration
    secret_key: str
    algorithm: str = "HS256"

    # ML Service Configuration (M4)
    ml_service_url: str = "http://localhost:8001"
    ml_service_timeout: int = 30

    # CORS Configuration
    cors_origins: List[str] = ["http://localhost:3000", "http://localhost:3001"]

    class Config:
        env_file = ".env"
        case_sensitive = False


# Global settings instance
settings = Settings()
