'use client';

import { useEffect, useState } from 'react';
import {
  DashboardSummary,
  RiskZone,
  Alert,
  Village,
  RoadSegment,
  CitizenReport,
} from '@/lib/api/types';
import {
  getDashboardSummary,
  getRiskZones,
  getAlerts,
  getVillages,
  getRoads,
  getCitizenReports,
} from '@/lib/api/services';
import SummaryCards from '@/components/dashboard/SummaryCards';
import PriorityZonesList from '@/components/dashboard/PriorityZonesList';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import MapContainer from '@/components/gis/MapContainer';
import Link from 'next/link';
import { SlidersHorizontal, ArrowRight, ShieldAlert, Activity, FileText } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [sumRes, zonesRes, alertsRes, vilRes, roadRes, repRes] = await Promise.all([
          getDashboardSummary(),
          getRiskZones(),
          getAlerts(),
          getVillages(),
          getRoads(),
          getCitizenReports(),
        ]);
        setSummary(sumRes);
        setZones(zonesRes);
        setAlerts(alertsRes);
        setVillages(vilRes);
        setRoads(roadRes);
        setReports(repRes);
        if (zonesRes.length > 0) setSelectedZone(zonesRes[0]);
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center space-y-3 text-slate-500">
        <div className="w-10 h-10 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="font-mono text-xs">Initializing Authority Control Room Feeds...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Hero Simulator Callout */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-balance text-2xl font-extrabold text-slate-950 flex items-center gap-2">
            <Activity className="w-6 h-6 text-sky-700" />
            <span>Disaster Operations Control Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time geospatial landslide risk analytics and decision support for North East India
          </p>
        </div>

        <Link
          href="/dashboard/simulator"
          className="button-primary px-5"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Launch Scenario Simulator</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Metric Summary Cards */}
      {summary && <SummaryCards summary={summary} />}

      {/* Main Grid: GIS Map + Priority Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive GIS Map (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="surface-card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="size-2.5 rounded-full bg-sky-500"></span>
              <h2 className="font-bold text-slate-950 text-sm">North Eastern GIS Map & Sector Overlays</h2>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-mono text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Critical</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> High</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Moderate</span>
              <span className="flex items-center gap-1"><span className="size-2.5 rounded-full bg-sky-500"></span> Village</span>
            </div>
          </div>

          <MapContainer
            zones={zones}
            villages={villages}
            roads={roads}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={(z) => setSelectedZone(z)}
          />

          {/* Selected Zone Quick Bar */}
          {selectedZone && (
            <div className="surface-card p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-slate-500">Selected Sector Details</span>
                <p className="font-bold text-slate-950 text-base">
                  {selectedZone.name} <span className="text-xs text-slate-500 font-mono">({selectedZone.district}, {selectedZone.state})</span>
                </p>
              </div>

              <div className="flex items-center gap-6 font-mono text-xs tabular-nums">
                <div>
                  <span className="text-slate-500 block text-[10px]">Risk Score</span>
                  <span className="font-bold text-red-600 text-sm">{selectedZone.risk_score} / 100</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">24h Rain</span>
                  <span className="font-bold text-sky-700 text-sm">{selectedZone.rainfall_mm} mm</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Soil Saturation</span>
                  <span className="font-bold text-sky-700 text-sm">{selectedZone.soil_moisture}%</span>
                </div>
              </div>

              <Link
                href={`/dashboard/zones/${selectedZone.zone_id}`}
                className="button-secondary px-4 py-2 text-xs"
              >
                Inspect Zone Profile
              </Link>
            </div>
          )}
        </div>

        {/* Priority Zones Sidebar (1 col) */}
        <div className="h-full">
          <PriorityZonesList
            zones={zones}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={(z) => setSelectedZone(z)}
          />
        </div>
      </div>

      {/* Lower Section: Alerts Feed + Citizen & Field Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel initialAlerts={alerts} />

        {/* Ground Field & Citizen Reports */}
        <div className="surface-card p-4 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-700" />
              <h2 className="font-bold text-slate-950 text-base">Ground Field & Citizen Feed</h2>
            </div>
            <span className="text-xs font-mono bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-100">
              Verified Reports
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[400px]">
            {reports.map((rep) => (
              <div key={rep.id} className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sky-700 font-mono">
                    {rep.report_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    By {rep.reporter_type}
                  </span>
                </div>
                <p className="text-slate-700 text-pretty">{rep.location_description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-1">
                  <span>Urgency: <strong className="text-red-600">{rep.urgency}</strong></span>
                  <span className="text-sky-700">✓ Ground Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
