"""Authentication and authorization schemas."""
from pydantic import BaseModel
from typing import Optional
from enum import Enum


class UserRole(str, Enum):
    """Supported user roles in the system."""

    ADMIN = "ADMIN"
    AUTHORITY = "AUTHORITY"
    FIELD_OFFICER = "FIELD_OFFICER"
    CITIZEN = "CITIZEN"


class TokenPayload(BaseModel):
    """JWT token payload structure."""

    sub: str  # User ID
    email: Optional[str] = None
    role: UserRole
    exp: Optional[int] = None


class CurrentUser(BaseModel):
    """Current authenticated user information."""

    user_id: str
    email: Optional[str] = None
    role: UserRole
