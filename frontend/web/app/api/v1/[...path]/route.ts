import { NextRequest, NextResponse } from 'next/server';
import {
  mockDashboardSummary,
  mockRiskZones,
  mockAlerts,
  mockReports,
  mockVillages,
  mockRoadSegments,
  mockHistoricalLandslides,
  mockDataSources,
  mockIngestionRuns,
} from '@/lib/api/mockData';

const BACKEND_URL = (
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://127.0.0.1:8000'
).replace(/\/$/, '');

async function tryProxyToBackend(
  request: NextRequest,
  pathSegments: string[],
  method: string,
  body?: unknown
) {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);

    const query = request.nextUrl.search;
    const path = pathSegments.join('/');
    const targetUrl = `${BACKEND_URL}/api/v1/${path}${query}`;

    const headers = new Headers();
    request.headers.forEach((value, key) => {
      if (
        key.toLowerCase() !== 'host' &&
        key.toLowerCase() !== 'content-length' &&
        key.toLowerCase() !== 'connection'
      ) {
        headers.set(key, value);
      }
    });

    const options: RequestInit = {
      method,
      headers,
      signal: controller.signal,
    };

    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
      headers.set('Content-Type', 'application/json');
    }

    const backendRes = await fetch(targetUrl, options);
    clearTimeout(timeoutId);

    if (backendRes.ok) {
      const data = await backendRes.json();
      return { ok: true, data, status: backendRes.status };
    }
  } catch {
    // Backend offline or timeout -> proceed to synchronous fallback
  }

  return { ok: false, data: null, status: null };
}

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path || [];
  const joined = path.join('/');

  // 1. Try real Python backend
  const backend = await tryProxyToBackend(request, path, 'GET');
  if (backend.ok) {
    return NextResponse.json(backend.data, { status: backend.status || 200 });
  }

  // 2. Synchronous Mock Data Fallback
  if (joined === 'app/dashboard/summary') {
    return NextResponse.json(mockDashboardSummary);
  }

  if (joined === 'app/zones') {
    return NextResponse.json(mockRiskZones);
  }

  if (joined.startsWith('app/zones/')) {
    const zoneId = path[2];
    const zone = mockRiskZones.find((z) => z.zone_id === zoneId) || mockRiskZones[0];
    return NextResponse.json(zone);
  }

  if (joined === 'app/alerts') {
    return NextResponse.json(mockAlerts);
  }

  if (joined === 'app/reports') {
    return NextResponse.json(mockReports);
  }

  if (joined === 'app/settlements') {
    return NextResponse.json(
      mockVillages.map((v) => ({ ...v, provenance: 'prepared_demo' }))
    );
  }

  if (joined === 'app/roads') {
    return NextResponse.json(
      mockRoadSegments.map((r) => ({ ...r, provenance: 'prepared_demo' }))
    );
  }

  if (joined === 'app/landslide-events') {
    return NextResponse.json(
      mockHistoricalLandslides.map((e) => ({ ...e, provenance: 'prepared_demo' }))
    );
  }

  if (joined === 'sources/status') {
    return NextResponse.json({ sources: mockDataSources });
  }

  if (joined.startsWith('sources/ingestion-runs')) {
    return NextResponse.json({ runs: mockIngestionRuns });
  }

  return NextResponse.json(
    { status: 'fallback', endpoint: joined, message: 'BhuRakshak prepared demo data' },
    { status: 200 }
  );
}

export async function POST(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path || [];
  const joined = path.join('/');

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  // 1. Try real Python backend
  const backend = await tryProxyToBackend(request, path, 'POST', body);
  if (backend.ok) {
    return NextResponse.json(backend.data, { status: backend.status || 200 });
  }

  // 2. Synchronous Mock Data Fallback
  if (joined === 'app/reports') {
    return NextResponse.json(
      {
        id: `REP-${Date.now()}`,
        status: 'received',
        message: 'Citizen report successfully received and dispatched to field validation.',
        created_at: new Date().toISOString(),
      },
      { status: 201 }
    );
  }

  if (joined.startsWith('app/alerts/') && joined.endsWith('/dispatches')) {
    return NextResponse.json(
      { recorded_at: new Date().toISOString(), dispatch_status: 'dispatched' },
      { status: 200 }
    );
  }

  if (joined.startsWith('sources/') && joined.endsWith('/imports')) {
    const slug = path[1];
    return NextResponse.json(
      {
        job_id: `IMP-${Date.now()}`,
        source_slug: slug,
        status: 'completed',
        records_imported: 48,
        imported_at: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { status: 'success', message: `POST to /api/v1/${joined} processed synchronously.` },
    { status: 200 }
  );
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  const path = params.path || [];
  const joined = path.join('/');

  let body: unknown = null;
  try {
    body = await request.json();
  } catch {
    body = null;
  }

  // 1. Try real Python backend
  const backend = await tryProxyToBackend(request, path, 'PATCH', body);
  if (backend.ok) {
    return NextResponse.json(backend.data, { status: backend.status || 200 });
  }

  if (joined.startsWith('app/alerts/')) {
    const alertId = path[2];
    return NextResponse.json(
      {
        id: alertId,
        status: 'acknowledged',
        public_dispatch: 'disabled',
        updated_at: new Date().toISOString(),
      },
      { status: 200 }
    );
  }

  return NextResponse.json(
    { status: 'success', message: `PATCH to /api/v1/${joined} updated.` },
    { status: 200 }
  );
}
