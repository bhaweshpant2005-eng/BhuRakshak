import { fetchApi } from './client';
import {
  DashboardSummary,
  RiskZone,
  SimulationRequest,
  SimulationResponse,
  Alert,
  Village,
  RoadSegment,
  HistoricalLandslide,
  CitizenReport,
} from './types';
import {
  mockDashboardSummary,
  mockRiskZones,
  mockAlerts,
  mockVillages,
  mockRoadSegments,
  mockHistoricalLandslides,
  mockReports,
} from './mockData';
import { getRiskLevel } from '../utils/riskUtils';

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const data = await fetchApi<DashboardSummary>('/api/v1/dashboard/summary');
  return data || mockDashboardSummary;
}

export async function getRiskZones(): Promise<RiskZone[]> {
  const data = await fetchApi<RiskZone[]>('/api/v1/risk/zones');
  return data || mockRiskZones;
}

export async function getZoneById(zoneId: string): Promise<RiskZone | null> {
  const data = await fetchApi<RiskZone>(`/api/v1/zones/${zoneId}`);
  if (data) return data;
  const found = mockRiskZones.find((z) => z.zone_id === zoneId);
  return found || mockRiskZones[0];
}

export async function runSimulation(req: SimulationRequest): Promise<SimulationResponse> {
  const realResult = await fetchApi<SimulationResponse>('/api/v1/simulation/run', {
    method: 'POST',
    body: JSON.stringify(req),
  });

  if (realResult) return realResult;

  // Curated Mock Simulation Engine for Hackathon Readiness
  let baseZone = mockRiskZones[0];
  if (req.zone_id) {
    const matched = mockRiskZones.find((z) => z.zone_id === req.zone_id);
    if (matched) baseZone = matched;
  }

  const currentRisk = baseZone.risk_score;
  const rainfallFactor = (req.rainfall_change_percent / 100) * 35;
  const durationFactor = (req.duration_hours / 24) * 12;
  
  let projected = Math.round(currentRisk + rainfallFactor + durationFactor);
  if (projected > 100) projected = 100;
  if (projected < 0) projected = 0;

  const currentLevel = getRiskLevel(currentRisk);
  const projectedLevel = getRiskLevel(projected);
  const delta = projected - currentRisk;

  let priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' = 'LOW';
  if (projected >= 76) priority = 'URGENT';
  else if (projected >= 51) priority = 'HIGH';
  else if (projected >= 26) priority = 'MEDIUM';

  const actions: string[] = [];
  if (projected >= 76) {
    actions.push(`IMMEDIATE: Issue Red Evacuation Warning for ${baseZone.affected_villages.join(', ')}`);
    actions.push(`TRAFFIC: Close and divert transit along ${baseZone.affected_roads.join(', ')}`);
    actions.push('DISASTER RESPONSE: Pre-deploy NDRF & State Disaster Response Force (SDRF) heavy equipment');
    actions.push('COMMUNICATION: Activate Cell Broadcast emergency alerts to all registered mobile numbers in sector');
  } else if (projected >= 51) {
    actions.push(`MONITORING: Increase sensor polling frequency in ${baseZone.name} to 5-minute intervals`);
    actions.push(`ADVISORY: Put local administration in ${baseZone.district} on High Standby`);
    actions.push(`INSPECTION: Dispatch field teams to inspect drainage channels along ${baseZone.affected_roads[0] || 'arterial roads'}`);
  } else {
    actions.push('ROUTINE: Continue automated satellite & weather radar monitoring');
    actions.push('NOTICE: Send routine rainfall updates to District Disaster Management Authority (DDMA)');
  }

  return {
    current_risk: currentRisk,
    projected_risk: projected,
    current_level: currentLevel,
    projected_level: projectedLevel,
    affected_villages: baseZone.affected_villages,
    affected_roads: baseZone.affected_roads,
    recommended_priority: priority,
    priority_actions: actions,
    delta_score: delta,
  };
}

export async function getAlerts(): Promise<Alert[]> {
  const data = await fetchApi<Alert[]>('/api/v1/alerts');
  return data || mockAlerts;
}

export async function acknowledgeAlert(alertId: string): Promise<Alert | null> {
  const data = await fetchApi<Alert>(`/api/v1/alerts/${alertId}`, {
    method: 'PATCH',
    body: JSON.stringify({ acknowledged: true }),
  });
  if (data) return data;

  const alert = mockAlerts.find((a) => a.id === alertId);
  if (alert) {
    alert.acknowledged = true;
    return { ...alert };
  }
  return null;
}

export async function getHistoricalLandslides(): Promise<HistoricalLandslide[]> {
  const data = await fetchApi<HistoricalLandslide[]>('/api/v1/history/landslides');
  return data || mockHistoricalLandslides;
}

export async function getVillages(): Promise<Village[]> {
  const data = await fetchApi<Village[]>('/api/v1/villages');
  return data || mockVillages;
}

export async function getRoads(): Promise<RoadSegment[]> {
  const data = await fetchApi<RoadSegment[]>('/api/v1/roads');
  return data || mockRoadSegments;
}

export async function getCitizenReports(): Promise<CitizenReport[]> {
  const data = await fetchApi<CitizenReport[]>('/api/v1/reports');
  return data || mockReports;
}
