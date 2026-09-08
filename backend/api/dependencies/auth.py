"""Authentication dependencies for JWT validation and role checking."""
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt
from datetime import datetime, timedelta
from typing import Optional

from backend.api.config import settings
from backend.api.schemas.auth import TokenPayload, CurrentUser, UserRole
from backend.api.schemas.errors import ErrorCode

security = HTTPBearer(auto_error=False)


def decode_token(token: str) -> Optional[TokenPayload]:
    """Decode and validate JWT token."""
    try:
        payload = jwt.decode(token, settings.secret_key, algorithms=[settings.algorithm])
        user_id: str = payload.get("sub")
        email: str = payload.get("email")
        role: str = payload.get("role")

        if user_id is None:
            return None

        return TokenPayload(sub=user_id, email=email, role=UserRole(role))
    except (JWTError, ValueError):
        return None


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> CurrentUser:
    """Validate JWT, or expose a read-only demo identity when explicitly enabled."""
    if credentials is None:
        if settings.demo_mode and settings.anonymous_demo_access:
            return CurrentUser(
                user_id="anonymous-demo",
                email="demo@localhost.invalid",
                role=UserRole.CITIZEN,
            )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"error": {"code": ErrorCode.UNAUTHORIZED, "message": "Authentication required"}},
        )
    token = credentials.credentials
    token_payload = decode_token(token)

    if token_payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={
                "error": {
                    "code": ErrorCode.UNAUTHORIZED,
                    "message": "Invalid or expired token",
                }
            },
        )

    return CurrentUser(user_id=token_payload.sub, email=token_payload.email, role=token_payload.role)


async def require_role(*allowed_roles: UserRole):
    """Dependency factory to require specific roles."""

    async def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail={
                    "error": {
                        "code": ErrorCode.INVALID_ROLE,
                        "message": f"Role {current_user.role} is not allowed for this operation",
                    }
                },
            )
        return current_user

    return role_checker
