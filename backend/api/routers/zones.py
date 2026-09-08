"""Risk zones endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from backend.api.schemas.risk import Zone
from backend.api.schemas.auth import CurrentUser
from backend.api.dependencies.auth import get_current_user
from backend.api.services.mock_data import MockDataService
from backend.api.schemas.errors import ErrorCode

router = APIRouter()


@router.get("/risk/zones", response_model=List[Zone])
async def get_risk_zones(current_user: CurrentUser = Depends(get_current_user)):
    """
    Get all landslide risk zones.
    
    Required role: ADMIN, AUTHORITY, FIELD_OFFICER, CITIZEN
    """
    try:
        zones = MockDataService.get_all_zones()
        return [Zone(**zone) for zone in zones]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": ErrorCode.INTERNAL_ERROR,
                    "message": "Failed to fetch risk zones",
                }
            },
        )


@router.get("/zones/{zone_id}", response_model=Zone)
async def get_zone_detail(zone_id: int, current_user: CurrentUser = Depends(get_current_user)):
    """
    Get details of a specific risk zone.
    
    Required role: ADMIN, AUTHORITY, FIELD_OFFICER, CITIZEN
    
    Args:
        zone_id: ID of the zone
    """
    try:
        zone = MockDataService.get_zone(zone_id)
        if not zone:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail={
                    "error": {
                        "code": ErrorCode.ZONE_NOT_FOUND,
                        "message": f"Zone {zone_id} not found",
                    }
                },
            )
        return Zone(**zone)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": ErrorCode.INTERNAL_ERROR,
                    "message": "Failed to fetch zone details",
                }
            },
        )
