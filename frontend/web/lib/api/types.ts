export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface RiskZone {
  zone_id: string;
  name: string;
  state: string;
  district: string;
  risk_score: number; // 0 - 100
  risk_level: RiskLevel;
  confidence: number; // 0 - 100%
  rainfall_mm: number; // 24h accumulated rainfall
  soil_moisture: number; // %
  slope_deg: number; // degrees
  elevation_m: number; // meters
  historical_events: number;
  affected_villages: string[];
  affected_roads: string[];
  risk_factors: string[];
  geometry: {
    lat: number;
    lng: number;
    coordinates?: [number, number][]; // optional polygon bounds
  };
  last_updated: string;
}

export interface DashboardSummary {
  total_zones: number;
  critical_zones: number;
  high_zones: number;
  moderate_zones: number;
  low_zones: number;
  active_alerts: number;
  high_risk_villages: number;
  blocked_roads_count: number;
  last_updated: string;
}

export interface SimulationRequest {
  zone_id?: string;
  rainfall_change_percent: number; // -50 to +200
  duration_hours: number; // 1 to 72
}

export interface SimulationResponse {
  current_risk: number;
  projected_risk: number;
  current_level: RiskLevel;
  projected_level: RiskLevel;
  affected_villages: string[];
  affected_roads: string[];
  recommended_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  priority_actions: string[];
  delta_score: number;
}

export interface Alert {
  id: string;
  zone_id: string;
  zone_name: string;
  severity: RiskLevel;
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  evacuation_recommended: boolean;
}

export interface Village {
  id: string;
  name: string;
  district: string;
  state: string;
  population: number;
  risk_score: number;
  risk_level: RiskLevel;
  nearest_zone_id: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface RoadSegment {
  id: string;
  name: string;
  highway_code: string;
  start_point: string;
  end_point: string;
  status: 'OPEN' | 'WARNING' | 'HIGH_RISK' | 'BLOCKED';
  risk_score: number;
  coordinates: [number, number][];
}

export interface HistoricalLandslide {
  id: string;
  date: string;
  location: string;
  state: string;
  district: string;
  risk_score_at_event: number;
  rainfall_recorded_mm: number;
  slope_deg: number;
  casualties: number;
  damage_summary: string;
}

export interface CitizenReport {
  id: string;
  zone_id: string;
  reporter_type: 'CITIZEN' | 'FIELD_AGENT';
  location_description: string;
  report_type: 'SOIL_CRACK' | 'ROCKFALL' | 'WATER_SEEPAGE' | 'TREE_TILT' | 'LANDSLIDE_IN_PROGRESS';
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
  verified: boolean;
}
