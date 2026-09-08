import { ApiResult, fetchApi } from './client';
import {
  Alert,
  CitizenReport,
  DashboardSummary,
  DataSourceStatus,
  HistoricalLandslide,
  RiskZone,
  RoadSegment,
  SimulationRequest,
  SimulationResponse,
  Village,
} from './types';
import {
  mockAlerts,
  mockDashboardSummary,
  mockHistoricalLandslides,
  mockReports,
  mockRiskZones,
  mockRoadSegments,
  mockVillages,
} from './mockData';
import { getRiskLevel } from '../utils/riskUtils';

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
  return result.ok ? result.data.sources : [];
}

// Legacy infrastructure routes still require a role token. Until the stable
// GeoJSON endpoints are populated, these arrays are explicit prepared demos.
export async function getVillages(): Promise<Village[]> {
  return preparedCopy(mockVillages);
}

export async function getRoads(): Promise<RoadSegment[]> {
  return preparedCopy(mockRoadSegments);
}

export async function getHistoricalLandslides(): Promise<HistoricalLandslide[]> {
  return preparedCopy(mockHistoricalLandslides);
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
