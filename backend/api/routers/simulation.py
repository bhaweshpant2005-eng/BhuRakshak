"""Scenario simulation endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from backend.api.schemas.simulation import SimulationRequest, SimulationResponse, SimulationResult, AffectedArea, PriorityLevel
from backend.api.schemas.auth import CurrentUser, UserRole
from backend.api.dependencies.auth import get_current_user
from backend.api.services.ml import get_ml_service
from backend.api.services.mock_data import MockDataService
from backend.api.schemas.errors import ErrorCode

router = APIRouter()


@router.post("/simulation/run", response_model=SimulationResponse)
async def run_simulation(
    request: SimulationRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Run scenario simulation to project risk under different rainfall conditions.
    
    Calls M4's simulation model to predict future risk based on scenario parameters.
    
    Required role: ADMIN, AUTHORITY, FIELD_OFFICER
    
    Args:
        request: Simulation parameters (zone_id, rainfall change %, duration)
        
    Returns:
        SimulationResponse with current and projected risk, affected areas, and recommendations
    """
    # Check authorization
    if current_user.role == UserRole.CITIZEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": ErrorCode.INVALID_ROLE,
                    "message": "Citizens cannot run simulations",
                }
            },
        )

    # Verify zone exists
    zone = MockDataService.get_zone(request.zone_id)
    if not zone:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={
                "error": {
                    "code": ErrorCode.ZONE_NOT_FOUND,
                    "message": f"Zone {request.zone_id} not found",
                }
            },
        )

    try:
        # Call M4 simulation service
        ml_service = get_ml_service()
        simulation_result = await ml_service.simulate_scenario(
            zone_id=request.zone_id,
            rainfall_change_percent=request.rainfall_change_percent,
            duration_hours=request.duration_hours,
            soil_moisture_percent=request.soil_moisture_percent,
        )

        if simulation_result is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": {
                        "code": ErrorCode.SIMULATION_FAILED,
                        "message": "Simulation service unavailable",
                    }
                },
            )

        # Get affected villages and roads in this zone
        affected_villages_data = MockDataService.get_villages_by_zone(request.zone_id)
        affected_roads_data = MockDataService.get_roads_by_zone(request.zone_id)

        # Build affected areas lists
        affected_villages = [
            AffectedArea(
                name=v["village_name"],
                type="village",
                latitude=v["latitude"],
                longitude=v["longitude"],
                population=v["population"],
                distance_km=0.0,  # TODO: Calculate from zone center
            )
            for v in affected_villages_data
        ]

        affected_roads = [
            AffectedArea(
                name=r["road_name"],
                type="road",
                latitude=r["latitude"] if "latitude" in r else 0.0,
                longitude=r["longitude"] if "longitude" in r else 0.0,
                distance_km=r["length_km"],
            )
            for r in affected_roads_data
        ]

        # Parse current and projected results
        current = SimulationResult(
            risk_score=simulation_result.get("current", {}).get("risk_score", 0),
            risk_level=simulation_result.get("current", {}).get("risk_level", "LOW"),
            confidence=simulation_result.get("current", {}).get("confidence", 0),
            risk_factors=simulation_result.get("current", {}).get("risk_factors", []),
        )

        projected = SimulationResult(
            risk_score=simulation_result.get("projected", {}).get("risk_score", 0),
            risk_level=simulation_result.get("projected", {}).get("risk_level", "LOW"),
            confidence=simulation_result.get("projected", {}).get("confidence", 0),
            risk_factors=simulation_result.get("projected", {}).get("risk_factors", []),
        )

        # Determine priority based on projected risk
        if projected.risk_level == "CRITICAL":
            priority = PriorityLevel.HIGH
        elif projected.risk_level == "HIGH":
            priority = PriorityLevel.MEDIUM
        else:
            priority = PriorityLevel.LOW

        return SimulationResponse(
            zone_id=request.zone_id,
            scenario={
                "rainfall_change_percent": request.rainfall_change_percent,
                "duration_hours": request.duration_hours,
            },
            current=current,
            projected=projected,
            affected_villages=affected_villages,
            affected_roads=affected_roads,
            recommended_priority=priority,
            timestamp=datetime.now(),
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": ErrorCode.SIMULATION_FAILED,
                    "message": "Scenario simulation failed",
                }
            },
        )
