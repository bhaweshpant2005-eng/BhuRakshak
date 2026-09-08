"""BhuRakshak FastAPI backend application."""
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.api.config import settings
from backend.api.database import close_database, initialize_database
from backend.api.middleware.rate_limit import InMemoryRateLimitMiddleware

# Import routers
from backend.api.routers import (
    alerts,
    app_data,
    dashboard,
    health,
    infrastructure,
    place_risk,
    reports,
    risk,
    simulation,
    sources,
    zones,
)


# Lifespan context manager
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize persistence and release pooled resources cleanly."""
    try:
        await initialize_database()
        logger.info("BhuRakshak backend started")
    except Exception:
        logger.exception("Database initialization failed")
        if settings.database_required:
            raise
    yield
    await close_database()
    logger.info("BhuRakshak backend stopped")


# Initialize FastAPI app
app = FastAPI(
    title=settings.title,
    description=settings.description,
    version=settings.version,
    openapi_url=f"{settings.api_prefix}/openapi.json",
    docs_url=f"{settings.api_prefix}/docs",
    redoc_url=f"{settings.api_prefix}/redoc",
    lifespan=lifespan,
)

# Configure request protection before routing. CORS is added afterward so
# rate-limit responses receive the same CORS headers as normal responses.
app.add_middleware(
    InMemoryRateLimitMiddleware,
    max_requests=settings.rate_limit_max_requests,
    window_seconds=settings.rate_limit_window_seconds,
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Include routers
app.include_router(health.router, prefix=settings.api_prefix, tags=["Health"])
app.include_router(dashboard.router, prefix=settings.api_prefix, tags=["Dashboard"])
app.include_router(zones.router, prefix=settings.api_prefix, tags=["Zones"])
app.include_router(risk.router, prefix=settings.api_prefix, tags=["Risk"])
app.include_router(simulation.router, prefix=settings.api_prefix, tags=["Simulation"])
app.include_router(alerts.router, prefix=settings.api_prefix, tags=["Alerts"])
app.include_router(reports.router, prefix=settings.api_prefix, tags=["Reports"])
app.include_router(infrastructure.router, prefix=settings.api_prefix, tags=["Infrastructure"])
app.include_router(sources.router, prefix=settings.api_prefix, tags=["Data Sources"])
app.include_router(place_risk.router, prefix=settings.api_prefix, tags=["Place Risk"])
app.include_router(app_data.router, prefix=settings.api_prefix, tags=["Application Data"])


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.title,
        "version": settings.version,
        "status": "operational",
        "api_docs": f"{settings.api_prefix}/docs",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "backend.api.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
        log_level="info",
    )
