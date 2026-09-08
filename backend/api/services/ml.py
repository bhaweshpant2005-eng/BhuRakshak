"""ML service integration with M4 risk prediction model."""
import httpx
from typing import Optional, Dict, Any
from backend.api.config import settings
from backend.api.schemas.risk import RiskScore, RiskLevel


class MLService:
    """Service for calling M4's risk prediction model."""

    def __init__(self):
        self.url = settings.ml_service_url
        self.timeout = settings.ml_service_timeout

    async def predict_risk(
        self,
        zone_id: int,
        rainfall_mm: Optional[float] = None,
        soil_moisture_percent: Optional[float] = None,
        slope_angle: Optional[float] = None,
        vegetation_index: Optional[float] = None,
        recent_earthquakes: bool = False,
    ) -> Optional[RiskScore]:
        """
        Call M4's risk prediction model.
        
        Args:
            zone_id: Risk zone identifier
            rainfall_mm: Recent rainfall in millimeters
            soil_moisture_percent: Soil moisture percentage
            slope_angle: Slope angle in degrees
            vegetation_index: Vegetation density index
            recent_earthquakes: Whether recent seismic activity detected
            
        Returns:
            RiskScore object or None if service unavailable
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "zone_id": zone_id,
                    "rainfall_mm": rainfall_mm,
                    "soil_moisture_percent": soil_moisture_percent,
                    "slope_angle": slope_angle,
                    "vegetation_index": vegetation_index,
                    "recent_earthquakes": recent_earthquakes,
                }

                response = await client.post(
                    f"{self.url}/predict",
                    json=payload,
                )

                if response.status_code == 200:
                    data = response.json()
                    return RiskScore(**data)

                return None
        except Exception:
            return None

    async def simulate_scenario(
        self,
        zone_id: int,
        rainfall_change_percent: float,
        duration_hours: int,
        soil_moisture_percent: Optional[float] = None,
    ) -> Optional[Dict[str, Any]]:
        """
        Call M4's scenario simulation model.
        
        Args:
            zone_id: Risk zone identifier
            rainfall_change_percent: Projected rainfall change percentage
            duration_hours: Duration of scenario in hours
            soil_moisture_percent: Current soil moisture
            
        Returns:
            Simulation result dict or None if service unavailable
        """
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                payload = {
                    "zone_id": zone_id,
                    "rainfall_change_percent": rainfall_change_percent,
                    "duration_hours": duration_hours,
                    "soil_moisture_percent": soil_moisture_percent,
                }

                response = await client.post(
                    f"{self.url}/simulate",
                    json=payload,
                )

                if response.status_code == 200:
                    return response.json()

                return None
        except Exception:
            return None


# Singleton instance
_ml_service: Optional[MLService] = None


def get_ml_service() -> MLService:
    """Get or create ML service instance."""
    global _ml_service
    if _ml_service is None:
        _ml_service = MLService()
    return _ml_service
