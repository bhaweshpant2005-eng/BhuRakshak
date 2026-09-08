"""Mock data service for development and testing before M5 database integration."""
from datetime import datetime, timedelta
from typing import List, Dict, Any
from backend.api.schemas.risk import RiskLevel
from backend.api.schemas.alerts import AlertStatus, AlertLevel
from backend.api.schemas.reports import ReportStatus, ReportType


class MockDataService:
    """Provides mock data for endpoints during development."""

    # Mock Zones
    MOCK_ZONES = [
        {
            "zone_id": 1,
            "zone_name": "Darjeeling High Risk",
            "district": "Darjeeling",
            "state": "West Bengal",
            "latitude": 27.0410,
            "longitude": 88.2663,
            "area_km2": 450.5,
            "risk_level": RiskLevel.CRITICAL,
            "last_updated": datetime.now(),
            "population": 85000,
            "critical_infrastructure": ["Hospital", "Highway", "Power Station"],
        },
        {
            "zone_id": 2,
            "zone_name": "Shimla Valley Risk",
            "district": "Shimla",
            "state": "Himachal Pradesh",
            "latitude": 31.7724,
            "longitude": 77.1089,
            "area_km2": 320.0,
            "risk_level": RiskLevel.HIGH,
            "last_updated": datetime.now(),
            "population": 62000,
            "critical_infrastructure": ["Hospital", "Highway"],
        },
        {
            "zone_id": 3,
            "zone_name": "Assam Foothills",
            "district": "Nagaon",
            "state": "Assam",
            "latitude": 25.5941,
            "longitude": 91.6869,
            "area_km2": 280.0,
            "risk_level": RiskLevel.MODERATE,
            "last_updated": datetime.now(),
            "population": 45000,
            "critical_infrastructure": ["Highway"],
        },
    ]

    # Mock Villages
    MOCK_VILLAGES = [
        {
            "village_id": 1,
            "village_name": "Pasupati",
            "district": "Darjeeling",
            "state": "West Bengal",
            "latitude": 27.0425,
            "longitude": 88.2680,
            "population": 3500,
            "zone_id": 1,
            "risk_level": "CRITICAL",
            "critical_facilities": ["School", "PHC"],
        },
        {
            "village_id": 2,
            "village_name": "Kurseong",
            "district": "Darjeeling",
            "state": "West Bengal",
            "latitude": 27.1145,
            "longitude": 88.2104,
            "population": 2800,
            "zone_id": 1,
            "risk_level": "HIGH",
            "critical_facilities": ["School"],
        },
        {
            "village_id": 3,
            "village_name": "Jispa",
            "district": "Shimla",
            "state": "Himachal Pradesh",
            "latitude": 31.7734,
            "longitude": 77.1099,
            "population": 1200,
            "zone_id": 2,
            "risk_level": "HIGH",
            "critical_facilities": [],
        },
    ]

    # Mock Roads
    MOCK_ROADS = [
        {
            "road_id": 1,
            "road_name": "NH44 Darjeeling Section",
            "road_type": "NH",
            "district": "Darjeeling",
            "state": "West Bengal",
            "length_km": 45.5,
            "zone_id": 1,
            "risk_level": "HIGH",
            "connectivity_importance": "HIGH",
        },
        {
            "road_id": 2,
            "road_name": "SH22 Shimla Valley",
            "road_type": "SH",
            "district": "Shimla",
            "state": "Himachal Pradesh",
            "length_km": 32.0,
            "zone_id": 2,
            "risk_level": "MODERATE",
            "connectivity_importance": "MEDIUM",
        },
        {
            "road_id": 3,
            "road_name": "NH31 Assam",
            "road_type": "NH",
            "district": "Nagaon",
            "state": "Assam",
            "length_km": 58.0,
            "zone_id": 3,
            "risk_level": "MODERATE",
            "connectivity_importance": "HIGH",
        },
    ]

    # Mock Alerts
    MOCK_ALERTS = [
        {
            "alert_id": 1,
            "zone_id": 1,
            "zone_name": "Darjeeling High Risk",
            "risk_level": AlertLevel.CRITICAL,
            "status": AlertStatus.ACTIVE,
            "triggered_at": datetime.now() - timedelta(hours=2),
            "updated_at": datetime.now() - timedelta(hours=1),
            "triggered_by": "system",
            "acknowledged_by": None,
            "acknowledged_at": None,
            "resolved_at": None,
            "description": "Heavy rainfall detected with high risk of landslide",
            "affected_population": 8500,
            "recommended_action": "Immediate evacuation recommended",
        },
        {
            "alert_id": 2,
            "zone_id": 2,
            "zone_name": "Shimla Valley Risk",
            "risk_level": AlertLevel.HIGH,
            "status": AlertStatus.ACKNOWLEDGED,
            "triggered_at": datetime.now() - timedelta(hours=6),
            "updated_at": datetime.now() - timedelta(hours=3),
            "triggered_by": "system",
            "acknowledged_by": "auth_user_123",
            "acknowledged_at": datetime.now() - timedelta(hours=3),
            "resolved_at": None,
            "description": "Elevated soil moisture levels",
            "affected_population": 6200,
            "recommended_action": "Monitor and prepare contingency plans",
        },
    ]

    # Mock Reports
    MOCK_REPORTS = [
        {
            "report_id": 1,
            "report_type": ReportType.INCIDENT,
            "zone_id": 1,
            "zone_name": "Darjeeling High Risk",
            "title": "Landslide Incident - Pasupati Village",
            "description": "Minor landslide on NH44 near Pasupati village, road blocked",
            "created_by": "field_officer_001",
            "created_at": datetime.now() - timedelta(days=1),
            "updated_at": datetime.now() - timedelta(hours=12),
            "status": ReportStatus.REVIEWED,
            "risk_assessment": {"risk_score": 78, "risk_level": "HIGH"},
            "affected_areas": ["Pasupati", "NH44"],
            "recommendations": ["Clear debris", "Reinforce slope"],
        },
        {
            "report_id": 2,
            "report_type": ReportType.ASSESSMENT,
            "zone_id": 2,
            "zone_name": "Shimla Valley Risk",
            "title": "Risk Assessment - SH22",
            "description": "Comprehensive risk assessment for SH22 corridor",
            "created_by": "authority_001",
            "created_at": datetime.now() - timedelta(days=3),
            "updated_at": datetime.now() - timedelta(days=2),
            "status": ReportStatus.CLOSED,
            "risk_assessment": {"risk_score": 62, "risk_level": "MODERATE"},
            "affected_areas": ["Shimla Valley"],
            "recommendations": ["Increase monitoring", "Maintain drainage"],
        },
    ]

    # Mock Landslide History
    MOCK_HISTORY = [
        {
            "incident_id": 1,
            "zone_id": 1,
            "zone_name": "Darjeeling High Risk",
            "date": datetime.now() - timedelta(days=30),
            "latitude": 27.0425,
            "longitude": 88.2680,
            "casualties": 0,
            "displaced_population": 250,
            "damage_estimate_inr": 45000000,
            "trigger_factor": "Heavy rainfall",
            "description": "Landslide blocked NH44 for 18 hours",
        },
        {
            "incident_id": 2,
            "zone_id": 1,
            "zone_name": "Darjeeling High Risk",
            "date": datetime.now() - timedelta(days=90),
            "latitude": 27.1145,
            "longitude": 88.2104,
            "casualties": 2,
            "displaced_population": 450,
            "damage_estimate_inr": 78000000,
            "trigger_factor": "Earthquake and rain",
            "description": "Major landslide near Kurseong destroyed several homes",
        },
    ]

    @staticmethod
    def get_dashboard_summary() -> Dict[str, Any]:
        """Get mock dashboard summary."""
        return {
            "total_zones": len(MockDataService.MOCK_ZONES),
            "zones_at_risk": {
                "CRITICAL": 1,
                "HIGH": 1,
                "MODERATE": 1,
                "LOW": 0,
            },
            "total_alerts_active": 2,
            "alerts_by_level": {
                "CRITICAL": 1,
                "HIGH": 1,
                "MODERATE": 0,
                "LOW": 0,
            },
            "total_affected_population": 14700,
            "last_update_time": datetime.now(),
        }

    @staticmethod
    def get_all_zones() -> List[Dict[str, Any]]:
        """Get all mock zones."""
        return MockDataService.MOCK_ZONES

    @staticmethod
    def get_zone(zone_id: int) -> Dict[str, Any] | None:
        """Get mock zone by ID."""
        for zone in MockDataService.MOCK_ZONES:
            if zone["zone_id"] == zone_id:
                return zone
        return None

    @staticmethod
    def get_villages() -> List[Dict[str, Any]]:
        """Get all mock villages."""
        return MockDataService.MOCK_VILLAGES

    @staticmethod
    def get_villages_by_zone(zone_id: int) -> List[Dict[str, Any]]:
        """Get mock villages in zone."""
        return [v for v in MockDataService.MOCK_VILLAGES if v["zone_id"] == zone_id]

    @staticmethod
    def get_roads() -> List[Dict[str, Any]]:
        """Get all mock roads."""
        return MockDataService.MOCK_ROADS

    @staticmethod
    def get_roads_by_zone(zone_id: int) -> List[Dict[str, Any]]:
        """Get mock roads in zone."""
        return [r for r in MockDataService.MOCK_ROADS if r["zone_id"] == zone_id]

    @staticmethod
    def get_all_alerts() -> List[Dict[str, Any]]:
        """Get all mock alerts."""
        return MockDataService.MOCK_ALERTS

    @staticmethod
    def get_active_alerts() -> List[Dict[str, Any]]:
        """Get active mock alerts."""
        return [a for a in MockDataService.MOCK_ALERTS if a["status"] == AlertStatus.ACTIVE]

    @staticmethod
    def get_all_reports() -> List[Dict[str, Any]]:
        """Get all mock reports."""
        return MockDataService.MOCK_REPORTS

    @staticmethod
    def get_history() -> List[Dict[str, Any]]:
        """Get mock landslide history."""
        return MockDataService.MOCK_HISTORY
