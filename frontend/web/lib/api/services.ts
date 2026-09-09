import { ApiResult, fetchApi } from './client';
import {
  Alert,
  CitizenReport,
  DashboardSummary,
  DataSourceStatus,
  HistoricalLandslide,
  IngestionRun,
  PlaceRiskResult,
  RiskZone,
  RoadSegment,
  SimulationRequest,
  SimulationResponse,
  SourceImportRequest,
  SourceImportResult,
  Village,
} from './types';
import {
  mockAlerts,
  mockDashboardSummary,
  mockDataSources,
  mockHistoricalLandslides,
  mockIngestionRuns,
  mockReports,
  mockRiskZones,
  mockRoadSegments,
  mockVillages,
} from './mockData';
import { getRiskLevel } from '../utils/riskUtils';
import { evaluatePlaceRisk } from './placeRiskEngine';

function preparedCopy<T>(value: T): T {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

function readFallback<T>(result: ApiResult<T>, fallback: T): T {
  if (result.ok) return result.data;
  console.warn(`[BhuRakshak] API unavailable (${result.error}); displaying prepared demo data.`);
  return preparedCopy(fallback);
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const result = await fetchApi<DashboardSummary>('/api/v1/app/dashboard/summary');
  return readFallback(result, { ...mockDashboardSummary, provenance: 'prepared_demo' });
}

export async function getRiskZones(): Promise<RiskZone[]> {
  const result = await fetchApi<RiskZone[]>('/api/v1/app/zones');
  return readFallback(
    result,
    mockRiskZones.map((zone) => ({ ...zone, provenance: 'prepared_demo' })),
  );
}

export async function getZoneById(zoneId: string): Promise<RiskZone | null> {
  const result = await fetchApi<RiskZone>(`/api/v1/app/zones/${zoneId}`);
  if (result.ok) return result.data;
  const found = mockRiskZones.find((zone) => zone.zone_id === zoneId);
  return found ? { ...preparedCopy(found), provenance: 'prepared_demo' } : null;
}

export async function getAlerts(): Promise<Alert[]> {
  const result = await fetchApi<Alert[]>('/api/v1/app/alerts');
  return readFallback(
    result,
    mockAlerts.map((alert) => ({ ...alert, status: 'prepared_demo', public_dispatch: 'disabled' })),
  );
}

export async function acknowledgeAlert(id: string): Promise<Alert | null> {
  const current = await fetchApi<Alert[]>(`/api/v1/app/alerts`);
  if (!current.ok) return null;
  const alert = current.data.find((item) => item.id === id);
  if (!alert || alert.status !== 'draft') return null;

  const result = await fetchApi<Pick<Alert, 'id' | 'status' | 'public_dispatch'>>(
    `/api/v1/app/alerts/${id}/approve-simulation`,
    { method: 'POST' },
  );
  if (!result.ok) return null;
  return { ...alert, ...result.data, acknowledged: true };
}

export async function recordResponseAction(
  alertId: string,
  actionType: 'medical' | 'authority' | 'warning_simulation',
  status: 'recorded' | 'cancelled',
): Promise<{ recorded_at: string } | null> {
  const result = await fetchApi<{ recorded_at: string }>(
    `/api/v1/app/alerts/${alertId}/response-actions`,
    {
      method: 'PUT',
      body: JSON.stringify({ action_type: actionType, status }),
    },
  );
  return result.ok ? result.data : null;
}

export async function getCitizenReports(): Promise<CitizenReport[]> {
  const result = await fetchApi<CitizenReport[]>('/api/v1/app/reports');
  return readFallback(
    result,
    mockReports.map((report) => ({
      ...report,
      status: report.verified ? 'verified' : 'pending',
      provenance: 'prepared_demo',
    })),
  );
}

export async function getDataSources(): Promise<DataSourceStatus[]> {
  const result = await fetchApi<{ sources: DataSourceStatus[] }>('/api/v1/sources/status');
  if (result.ok) return result.data.sources;
  return preparedCopy(mockDataSources);
}

export async function getIngestionRuns(sourceSlug?: string): Promise<IngestionRun[]> {
  const query = sourceSlug ? `?source_slug=${encodeURIComponent(sourceSlug)}` : '';
  const result = await fetchApi<{ runs: IngestionRun[] }>(`/api/v1/sources/ingestion-runs${query}`);
  if (result.ok) return result.data.runs;
  const filtered = sourceSlug
    ? mockIngestionRuns.filter((r) => r.source_slug === sourceSlug)
    : mockIngestionRuns;
  return preparedCopy(filtered);
}

export async function importInstitutionalSource(
  request: SourceImportRequest,
): Promise<ApiResult<SourceImportResult>> {
  const form = new FormData();
  form.set('file', request.file);
  form.set('west', String(request.west));
  form.set('south', String(request.south));
  form.set('east', String(request.east));
  form.set('north', String(request.north));
  form.set('source_version', request.sourceVersion);
  form.set('authorization_reference', request.authorizationReference);
  form.set('license_reference', request.licenseReference);
  form.set('terms_acknowledged', 'true');
  if (request.observedAt) form.set('observed_at', request.observedAt);
  if (request.variable) form.set('variable', request.variable);
  if (request.unit) form.set('unit', request.unit);

  return fetchApi<SourceImportResult>(`/api/v1/sources/${request.sourceSlug}/imports`, {
    method: 'POST',
    body: form,
    headers: request.authorityToken
      ? { Authorization: `Bearer ${request.authorityToken}` }
      : undefined,
  });
}

export async function lookupPlaceRisk(
  address: string,
  refreshWeather = false,
): Promise<ApiResult<PlaceRiskResult>> {
  const query = new URLSearchParams({ address, refresh_weather: String(refreshWeather) });

  // 1. Primary: FastAPI backend endpoint
  try {
    const backendResult = await fetchApi<PlaceRiskResult>(`/api/v1/place-risk?${query}`);
    if (backendResult.ok && backendResult.data) {
      return backendResult;
    }
  } catch (err) {
    console.warn('[BhuRakshak] Backend place-risk API unreachable, falling back to Next.js route:', err);
  }

  // 2. Secondary: Internal Next.js API route (/api/place-risk)
  try {
    const nextResult = await fetchApi<PlaceRiskResult>(`/api/place-risk?${query}`);
    if (nextResult.ok && nextResult.data) {
      return nextResult;
    }
  } catch (err) {
    console.warn('[BhuRakshak] Next.js route unreachable, using local engine fallback:', err);
  }

  // 3. Tertiary: Resilient local evaluation engine
  try {
    const calculated = await evaluatePlaceRisk(address, refreshWeather);
    return { ok: true, data: calculated, status: 200 };
  } catch (fallbackError) {
    console.error('[BhuRakshak] Local place risk calculation failed:', fallbackError);
    return {
      ok: false,
      error: fallbackError instanceof Error ? fallbackError.message : 'Unable to assess location risk.',
      status: 500,
    };
  }
}



export async function getVillages(): Promise<Village[]> {
  const result = await fetchApi<Village[]>('/api/v1/app/settlements');
  return readFallback(
    result,
    mockVillages.map((village) => ({ ...village, provenance: 'prepared_demo' })),
  );
}

export async function getRoads(): Promise<RoadSegment[]> {
  const result = await fetchApi<RoadSegment[]>('/api/v1/app/roads');
  return readFallback(
    result,
    mockRoadSegments.map((road) => ({ ...road, provenance: 'prepared_demo' })),
  );
}

export async function getHistoricalLandslides(): Promise<HistoricalLandslide[]> {
  const result = await fetchApi<HistoricalLandslide[]>('/api/v1/app/landslide-events');
  return readFallback(
    result,
    mockHistoricalLandslides.map((event) => ({ ...event, provenance: 'prepared_demo' })),
  );
}

export async function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  const result = await fetchApi<SimulationResponse>('/api/v1/simulation/run', {
    method: 'POST',
    body: JSON.stringify(req),
  });
  if (result.ok) return result.data;

  let baseZone = mockRiskZones[0];
  if (req.zone_id) {
    baseZone = mockRiskZones.find((zone) => zone.zone_id === req.zone_id) ?? baseZone;
  }
  const currentRisk = baseZone.risk_score;
  const projected = Math.min(
    100,
    Math.max(0, Math.round(currentRisk + (req.rainfall_change_percent / 100) * 35 + (req.duration_hours / 24) * 12)),
  );
  const priority = projected >= 76 ? 'URGENT' : projected >= 51 ? 'HIGH' : projected >= 26 ? 'MEDIUM' : 'LOW';
  const actions = projected >= 76
    ? [
      `SIMULATION: Prepare an evacuation-warning draft for ${baseZone.affected_villages.join(', ')}.`,
      `SIMULATION: Prepare road restrictions for ${baseZone.affected_roads.join(', ')}.`,
      'AUTHORITY REVIEW: Obtain authenticated approval before contacting the public or response agencies.',
    ]
    : projected >= 51
      ? [
        `MONITORING: Review ${baseZone.name} at shorter intervals.`,
        `ADVISORY DRAFT: Prepare a high-standby brief for ${baseZone.district}.`,
      ]
      : ['ROUTINE: Continue modelled weather and prepared satellite monitoring.'];

  return {
    current_risk: currentRisk,
    projected_risk: projected,
    current_level: getRiskLevel(currentRisk),
    projected_level: getRiskLevel(projected),
    affected_villages: baseZone.affected_villages,
    affected_roads: baseZone.affected_roads,
    recommended_priority: priority,
    priority_actions: actions,
    delta_score: projected - currentRisk,
  };
}

