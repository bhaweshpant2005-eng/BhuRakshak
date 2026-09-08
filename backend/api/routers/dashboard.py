"""Dashboard endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from backend.api.schemas.risk import DashboardSummary
from backend.api.schemas.auth import CurrentUser
from backend.api.dependencies.auth import get_current_user
from backend.api.services.mock_data import MockDataService
from backend.api.schemas.errors import ErrorCode

router = APIRouter()


@router.get("/dashboard/summary", response_model=DashboardSummary)
async def get_dashboard_summary(current_user: CurrentUser = Depends(get_current_user)):
    """
    Get dashboard summary with overview of all zones, alerts, and affected population.
    
    Required role: ADMIN, AUTHORITY, FIELD_OFFICER, CITIZEN
    """
    try:
        summary = MockDataService.get_dashboard_summary()
        return DashboardSummary(**summary)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": ErrorCode.INTERNAL_ERROR,
                    "message": "Failed to fetch dashboard summary",
                }
            },
        )
