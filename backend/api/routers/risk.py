"""Risk prediction endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from datetime import datetime
from backend.api.schemas.risk import RiskPredictionRequest, RiskPredictionResponse, RiskScore, RiskLevel
from backend.api.schemas.auth import CurrentUser, UserRole
from backend.api.dependencies.auth import get_current_user
from backend.api.services.ml import get_ml_service
from backend.api.services.mock_data import MockDataService
from backend.api.schemas.errors import ErrorCode

router = APIRouter()


@router.post("/risk/predict", response_model=RiskPredictionResponse)
async def predict_risk(
    request: RiskPredictionRequest,
    current_user: CurrentUser = Depends(get_current_user),
):
    """
    Predict landslide risk for a zone based on environmental parameters.
    
    Calls M4's ML model to calculate current risk score.
    
    Required role: ADMIN, AUTHORITY, FIELD_OFFICER
    
    Args:
        request: Risk prediction parameters including zone_id and environmental factors
        
    Returns:
        RiskPredictionResponse with risk score, level, and recommendations
    """
    # Check authorization
    if current_user.role == UserRole.CITIZEN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail={
                "error": {
                    "code": ErrorCode.INVALID_ROLE,
                    "message": "Citizens cannot perform risk predictions",
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
        # Call M4 ML service
        ml_service = get_ml_service()
        prediction = await ml_service.predict_risk(
            zone_id=request.zone_id,
            rainfall_mm=request.rainfall_mm,
            soil_moisture_percent=request.soil_moisture_percent,
            slope_angle=request.slope_angle,
            vegetation_index=request.vegetation_index,
            recent_earthquakes=request.recent_earthquakes,
        )

        if prediction is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail={
                    "error": {
                        "code": ErrorCode.ML_SERVICE_UNAVAILABLE,
                        "message": "ML prediction service unavailable",
                    }
                },
            )

        # Determine recommended action based on risk level
        recommended_action = None
        if prediction.risk_level == RiskLevel.CRITICAL:
            recommended_action = "Immediate evacuation recommended"
        elif prediction.risk_level == RiskLevel.HIGH:
            recommended_action = "Prepare evacuation plans and issue alerts"
        elif prediction.risk_level == RiskLevel.MODERATE:
            recommended_action = "Monitor situation and increase surveillance"
        else:
            recommended_action = "Continue routine monitoring"

        return RiskPredictionResponse(
            zone_id=request.zone_id,
            prediction=prediction,
            timestamp=datetime.now(),
            recommended_action=recommended_action,
        )

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={
                "error": {
                    "code": ErrorCode.INTERNAL_ERROR,
                    "message": "Risk prediction failed",
                }
            },
        )
