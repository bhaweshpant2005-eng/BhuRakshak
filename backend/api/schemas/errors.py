"""Error schemas for standardized API responses."""
from pydantic import BaseModel
from typing import Optional, Any


class ErrorDetail(BaseModel):
    """Standardized error detail structure."""

    code: str
    message: str
    details: Optional[Any] = None


class ErrorResponse(BaseModel):
    """Standardized error response format."""

    error: ErrorDetail


# Common error codes
class ErrorCode:
    """Standard error codes for the API."""

    INVALID_REQUEST = "INVALID_REQUEST"
    UNAUTHORIZED = "UNAUTHORIZED"
    FORBIDDEN = "FORBIDDEN"
    NOT_FOUND = "NOT_FOUND"
    CONFLICT = "CONFLICT"
    VALIDATION_ERROR = "VALIDATION_ERROR"
    INTERNAL_ERROR = "INTERNAL_ERROR"
    ZONE_NOT_FOUND = "ZONE_NOT_FOUND"
    ALERT_NOT_FOUND = "ALERT_NOT_FOUND"
    REPORT_NOT_FOUND = "REPORT_NOT_FOUND"
    ML_SERVICE_UNAVAILABLE = "ML_SERVICE_UNAVAILABLE"
    DATABASE_ERROR = "DATABASE_ERROR"
    INVALID_ROLE = "INVALID_ROLE"
    SIMULATION_FAILED = "SIMULATION_FAILED"
