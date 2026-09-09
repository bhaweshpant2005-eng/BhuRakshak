import { NextRequest, NextResponse } from 'next/server';
import { mockRiskZones } from '@/lib/api/mockData';
import { RiskLevel, SimulationRequest, SimulationResponse } from '@/lib/api/types';

const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000'
).replace(/\/$/, '');

export async function POST(request: NextRequest) {
  let body: SimulationRequest;
  try {
    body = await request.json();
  } catch {
    body = {
      rainfall_change_percent: 50,
      duration_hours: 24,
    };
  }

  // 1. Try forwarding to Python backend if it is running
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const backendRes = await fetch(`${BACKEND_URL}/api/v1/simulation/run`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const data = await backendRes.json();
      return NextResponse.json(data);
    }
  } catch {
    // Backend offline or unreachable - fall through to synchronous simulation engine
  }

  // 2. Synchronous robust simulation computation
  const targetZoneId = body.zone_id || 'Z-NER-001';
  const baseZone = mockRiskZones.find((z) => z.zone_id === targetZoneId) || mockRiskZones[0];

  const currentRisk = baseZone.risk_score;
  const rainfallImpact = (body.rainfall_change_percent / 100) * 35;
  const durationImpact = (body.duration_hours / 24) * 12;

  const projectedRisk = Math.min(
    100,
    Math.max(0, Math.round(currentRisk + rainfallImpact + durationImpact))
  );

  const getLevel = (score: number): RiskLevel => {
    if (score >= 76) return 'CRITICAL';
    if (score >= 51) return 'HIGH';
    if (score >= 26) return 'MODERATE';
    return 'LOW';
  };

  const currentLevel = getLevel(currentRisk);
  const projectedLevel = getLevel(projectedRisk);

  const recommendedPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT' =
    projectedRisk >= 76
      ? 'URGENT'
      : projectedRisk >= 51
      ? 'HIGH'
      : projectedRisk >= 26
      ? 'MEDIUM'
      : 'LOW';

  const priorityActions: string[] =
    projectedRisk >= 76
      ? [
          `SIMULATION: Prepare an evacuation-warning draft for ${baseZone.affected_villages.join(', ')}.`,
          `SIMULATION: Prepare road restrictions for ${baseZone.affected_roads.join(', ')}.`,
          'AUTHORITY REVIEW: Obtain authenticated approval before contacting the public or response agencies.',
        ]
      : projectedRisk >= 51
      ? [
          `MONITORING: Review ${baseZone.name} at shorter intervals.`,
          `ADVISORY DRAFT: Prepare a high-standby brief for ${baseZone.district}.`,
          'AUTHORITY REVIEW: Verify drainage and slope telemetry.',
        ]
      : ['ROUTINE: Continue modelled weather and prepared satellite monitoring.'];

  const responsePayload: SimulationResponse = {
    current_risk: currentRisk,
    projected_risk: projectedRisk,
    current_level: currentLevel,
    projected_level: projectedLevel,
    affected_villages: baseZone.affected_villages,
    affected_roads: baseZone.affected_roads,
    recommended_priority: recommendedPriority,
    priority_actions: priorityActions,
    delta_score: projectedRisk - currentRisk,
  };

  return NextResponse.json(responsePayload, { status: 200 });
}
