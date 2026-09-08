"""NER-SENTRY FastAPI Backend - Main Application Entry Point."""
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

from backend.api.config import settings
from backend.api.schemas.errors import ErrorResponse, ErrorDetail
from backend.api.schemas.risk import DashboardSummary

# Import routers
from backend.api.routers import dashboard, zones, risk, simulation, alerts, reports, infrastructure, health


# Lifespan context manager
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application startup and shutdown events."""
    # Startup
    print("🚀 NER-SENTRY Backend Starting...")
    yield
    # Shutdown
    print("🛑 NER-SENTRY Backend Shutting Down...")


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
