"""Health and readiness endpoints."""
from datetime import datetime, timezone

from fastapi import APIRouter

from backend.api.config import settings
from backend.api.database import check_database

router = APIRouter()


@router.get("/health")
async def health_check():
    """Lightweight liveness check; it does not claim providers are live."""
    return {
        "status": "healthy",
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "service": "BhuRakshak Backend",
        "mode": "prepared_demo" if settings.demo_mode else "operational",
    }


@router.get("/ready")
async def readiness_check():
    """Readiness details for local persistence and optional services."""
    database_ready = await check_database()
    return {
        "status": "ready" if database_ready else "degraded",
        "database": "ready" if database_ready else "unavailable",
        "object_storage": (
            "configured" if settings.object_storage_endpoint else "local_filesystem"
        ),
        "restricted_sources": "not_configured",
        "public_alert_dispatch": "disabled",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
