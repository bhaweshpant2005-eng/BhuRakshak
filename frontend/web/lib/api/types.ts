export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type Provenance =
  | 'live_observed'
  | 'live_modelled'
  | 'cached_observed'
  | 'cached_modelled'
  | 'derived'
  | 'static_reference'
  | 'prepared_demo'
  | 'synthetic_demo'
  | 'unavailable';

export interface DataState {
  provenance: Provenance;
  fallback: boolean;
  error?: string;
}

export interface DataSourceStatus {
  slug: string;
  name: string;
  category: string;
  provider: string;
  access_type: string;
  provenance: Provenance;
  status: string;
  license_name?: string | null;
  attribution?: string | null;
  credential_env?: string | null;
  last_success_at?: string | null;
  last_error?: string | null;
  freshness_seconds?: number | null;
  metadata: Record<string, unknown>;
<<<<<<< HEAD
  credential_configured: boolean;
  file_import_available: boolean;
  provider_adapter_status: string;
  accepted_formats: string[];
  authorization_required: boolean;
  operator_guidance?: string | null;
}

export interface IngestionRun {
  id: number;
  source_slug: string;
  source_name: string;
  status: 'running' | 'succeeded' | 'failed';
  started_at: string;
  finished_at?: string | null;
  coverage_start?: string | null;
  coverage_end?: string | null;
  records_read: number;
  records_written: number;
  quality_flags: string[];
  error?: string | null;
  ingestion_method?: string | null;
  original_filename?: string | null;
  media_type?: string | null;
  checksum?: string | null;
}

export interface SourceImportRequest {
  sourceSlug: string;
  file: File;
  west: number;
  south: number;
  east: number;
  north: number;
  sourceVersion: string;
  observedAt?: string;
  authorizationReference: string;
  licenseReference: string;
  variable?: string;
  unit?: string;
  authorityToken?: string;
}

export interface SourceImportResult {
  run_id: number;
  status: string;
  records_read: number;
  records_written: number;
  checksum?: string | null;
  quality_flags: string[];
=======
>>>>>>> 9e69ff4 (finished the frontend source status view and  simulation labels)
}

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
  provenance?: Provenance;
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
  provenance?: Provenance;
<<<<<<< HEAD
}

export interface PlaceRiskResult {
  query: string;
  display_name: string;
  latitude: number;
  longitude: number;
  matched_zone: RiskZone | null;
  distance_km: number | null;
  risk_score: number | null;
  risk_level: RiskLevel | 'UNAVAILABLE';
  confidence: number;
  reasons: string[];
  missing_features: string[];
  weather_refresh?: SourceImportResult | null;
  provenance: Provenance;
  disclaimer: string;
=======
>>>>>>> 9e69ff4 (finished the frontend source status view and  simulation labels)
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
  status?: string;
  public_dispatch?: 'disabled';
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
  status?: 'pending' | 'verified' | 'rejected';
  provenance?: Provenance;
<<<<<<< HEAD
}
=======
}
>>>>>>> 9e69ff4 (finished the frontend source status view and  simulation labels)
