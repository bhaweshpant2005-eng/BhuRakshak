"""Infrastructure endpoints for villages, roads, and landslide history."""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List
from backend.api.schemas.infrastructure import Village, Road, VillageListResponse, RoadListResponse, LandslideHistory, HistoryResponse
from backend.api.schemas.auth import CurrentUser
from backend.api.dependencies.auth import get_current_user
from backend.api.services.mock_data import MockDataService
from backend.api.schemas.errors import ErrorCode

router = APIRouter()


@router.get("/villages", response_model=VillageListResponse)
async def get_villages(
    zone_id: int | None = Query(None),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get villages, optionally filtered by zone.
    
    Required role: ADMIN, AUTHORITY, FIELD_OFFICER, CITIZEN
    
    Args:
        zone_id: Optional zone ID to filter by
        
    Returns:
        List of villages
    """
    try:
        villages = MockDataService.get_villages()

        # Filter by zone if provided
        if zone_id:
            villages = [v for v in villages if v["zone_id"] == zone_id]

        village_responses = [Village(**v) for v in villages]

        return VillageListResponse(
            villages=village_responses,
            total=len(village_responses),
            zone_id=zone_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": ErrorCode.INTERNAL_ERROR,
                    "message": "Failed to fetch villages",
                }
            },
        )


@router.get("/roads", response_model=RoadListResponse)
async def get_roads(
    zone_id: int | None = Query(None),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get roads, optionally filtered by zone.
    
    Required role: ADMIN, AUTHORITY, FIELD_OFFICER, CITIZEN
    
    Args:
        zone_id: Optional zone ID to filter by
        
    Returns:
        List of roads
    """
    try:
        roads = MockDataService.get_roads()

        # Filter by zone if provided
        if zone_id:
            roads = [r for r in roads if r["zone_id"] == zone_id]

        road_responses = [Road(**r) for r in roads]

        return RoadListResponse(
            roads=road_responses,
            total=len(road_responses),
            zone_id=zone_id,
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": ErrorCode.INTERNAL_ERROR,
                    "message": "Failed to fetch roads",
                }
            },
        )


@router.get("/history/landslides", response_model=HistoryResponse)
async def get_landslide_history(
    zone_id: int | None = Query(None),
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Get historical landslide incidents, optionally filtered by zone.
    
    Required role: ADMIN, AUTHORITY, FIELD_OFFICER, CITIZEN
    
    Args:
        zone_id: Optional zone ID to filter by
        
    Returns:
        List of historical incidents
    """
    try:
        incidents = MockDataService.get_history()

        # Filter by zone if provided
        if zone_id:
            incidents = [i for i in incidents if i["zone_id"] == zone_id]

        history_responses = [LandslideHistory(**i) for i in incidents]

        return HistoryResponse(
            incidents=history_responses,
            total=len(history_responses),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": ErrorCode.INTERNAL_ERROR,
                    "message": "Failed to fetch landslide history",
                }
            },
        )
