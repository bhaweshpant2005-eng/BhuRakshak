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
}

export interface RiskZone {
  zone_id: string;
  name: string;
  state: string;
  district: string;
  risk_score: number;
  risk_level: RiskLevel;
  confidence: number;
  rainfall_mm: number;
  soil_moisture: number;
  slope_deg: number;
  elevation_m: number;
  historical_events: number;
  affected_villages: string[];
  affected_roads: string[];
  risk_factors: string[];
  geometry: {
    lat: number;
    lng: number;
    coordinates?: [number, number][];
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
}

export interface PlaceRiskHistoricalContext {
  status: 'events_found' | 'none_in_current_catalogue';
  search_radius_km: number;
  total_nearby: number;
  nearest_event: NearbyHistoricalLandslide | null;
  events: NearbyHistoricalLandslide[];
  disclaimer: string;
}

export interface NearbyHistoricalLandslide extends HistoricalLandslide {
  distance_km: number;
}

export interface PlaceRiskWeatherData {
  temperature_c: number;
  rainfall_current_mm: number;
  humidity_percent: number;
  wind_speed_kmh: number;
  weather_desc: string;
  recorded_at?: string;
  elevation_m?: number;
}

export interface PlaceRegionalContext {
  sector: string;
  state: string;
  district: string;
  elevation_approx_m?: number;
  regional_hazard: string;
  helpline_seoc: string;
  helpline_ddma: string;
  disaster_control_room: string;
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
  weather_refresh_error?: string | null;
  historical_landslides: PlaceRiskHistoricalContext;
  provenance: Provenance;
  disclaimer: string;
  weather_data?: PlaceRiskWeatherData;
  regional_context?: PlaceRegionalContext;
}

export interface SimulationRequest {
  zone_id?: string;
  rainfall_change_percent: number;
  duration_hours: number;
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
    lat: number | null;
    lng: number | null;
  };
  provenance?: Provenance;
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
  zone_id?: string | null;
  provenance?: Provenance;
}

export interface HistoricalLandslide {
  id: string;
  date: string | null;
  location: string;
  state: string;
  district: string;
  risk_score_at_event: number | null;
  rainfall_recorded_mm: number | null;
  slope_deg: number | null;
  casualties: number;
  damage_summary: string;
  latitude?: number | null;
  longitude?: number | null;
  distance_km?: number;
  event_type?: string | null;
  certainty?: string | null;
  source_name?: string | null;
  provenance?: Provenance;
  zone_id?: string | null;
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
}

export interface LandslideDetectionHotspot {
  id: string;
  name: string;
  bbox: [number, number, number, number];
  centroid_geo: { lat: number; lng: number };
  area_m2: number;
  area_ha: number;
  confidence: number;
  severity: RiskLevel;
  threatened_assets: string[];
}

export interface LandslideDetectionResult {
  sector_id: string;
  sector_name: string;
  state: string;
  district: string;
  model_metadata: {
    name: string;
    architecture: string;
    encoder: string;
    channels: number;
    best_epoch: number;
    val_iou: number;
    val_dice: number;
    precision: number;
    recall: number;
    checkpoint_size_mb: number;
    inference_device: string;
    inference_time_ms: number;
  };
  input_dimensions: { width: number; height: number; channels: number };
  active_bands: string[];
  detection_threshold: number;
  landslide_detected: boolean;
  overall_confidence: number;
  coverage_percent: number;
  total_area_m2: number;
  total_area_ha: number;
  peak_probability: number;
  risk_level: RiskLevel;
  hotspots: LandslideDetectionHotspot[];
  action_recommendations: string[];
  telemetry: {
    slope_deg: number;
    rainfall_24h_mm: number;
    soil_moisture_pct: number;
    elevation_m: number;
  };
}

