'use client';

import { useEffect, useMemo, useState } from 'react';
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
import SummaryCards, { SummaryFilter } from '@/components/dashboard/SummaryCards';
import PriorityZonesList from '@/components/dashboard/PriorityZonesList';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import EmergencyResponsePanel from '@/components/dashboard/EmergencyResponsePanel';
import MapContainer from '@/components/gis/MapContainer';
import Link from 'next/link';
import { SlidersHorizontal, ArrowRight, ShieldAlert, Activity, FileText, Search, Filter, X } from 'lucide-react';

export default function DashboardOverviewPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [reports, setReports] = useState<CitizenReport[]>([]);
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [summaryFilter, setSummaryFilter] = useState<SummaryFilter>('ALL');
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

  // Compute live real-time metrics so summary cards respond immediately to live changes
  const liveSummary = useMemo(() => {
    if (!summary && zones.length === 0) return null;
    const critical = zones.filter((z) => z.risk_level === 'CRITICAL').length;
    const high = zones.filter((z) => z.risk_level === 'HIGH').length;
    const unackAlerts = alerts.filter((a) => !a.acknowledged).length;
    const monitoredVillages = zones.reduce(
      (acc, z) => acc + (z.affected_villages?.length || 0),
      0,
    );
    const blockedRoads = roads.filter((r) => r.status === 'BLOCKED').length;

    return {
      total_zones: zones.length || summary?.total_zones || 0,
      critical_zones: critical || summary?.critical_zones || 0,
      high_zones: high || summary?.high_zones || 0,
      moderate_zones: zones.filter((z) => z.risk_level === 'MODERATE').length || summary?.moderate_zones || 0,
      low_zones: zones.filter((z) => z.risk_level === 'LOW').length || summary?.low_zones || 0,
      active_alerts: unackAlerts,
      high_risk_villages: monitoredVillages || summary?.high_risk_villages || 0,
      blocked_roads_count: blockedRoads || summary?.blocked_roads_count || 0,
      last_updated: summary?.last_updated || new Date().toISOString(),
      provenance: summary?.provenance || 'derived',
    };
  }, [summary, zones, alerts, roads]);

  // Dynamically filtered zones based on clicked SummaryCard
  const filteredZones = useMemo(() => {
    switch (summaryFilter) {
      case 'CRITICAL':
        return zones.filter((z) => z.risk_level === 'CRITICAL');
      case 'HIGH':
        return zones.filter((z) => z.risk_level === 'HIGH');
      case 'VILLAGES':
        return zones.filter((z) => (z.affected_villages?.length || 0) > 0);
      case 'ROADS':
        return zones.filter((z) => (z.affected_roads?.length || 0) > 0);
      default:
        return zones;
    }
  }, [zones, summaryFilter]);

  const handleFilterChange = (filter: SummaryFilter) => {
    setSummaryFilter(filter);
    if (filter === 'ALERTS') {
      const el = document.getElementById('alerts-feed-section');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAlertAcknowledged = (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
  };

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
            Provenance-aware landslide risk decision support for North East India
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/place-risk" className="button-secondary px-5">
            <Search className="w-4 h-4" />
            <span>Check a Place</span>
          </Link>
          <Link
            href="/dashboard/simulator"
            className="button-primary px-5"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Launch Scenario Simulator</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Metric Summary Cards */}
      {(liveSummary || summary) && (
        <SummaryCards
          summary={liveSummary ?? (summary as DashboardSummary)}
          activeFilter={summaryFilter}
          onFilterChange={handleFilterChange}
        />
      )}

      {/* Interactive Filter Reset Bar */}
      {summaryFilter !== 'ALL' && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-sky-50 border border-sky-200 text-xs text-sky-900 animate-in fade-in">
          <div className="flex items-center gap-2 font-medium">
            <Filter className="size-3.5 text-sky-700" />
            <span>
              Filtering display by <strong>{summaryFilter}</strong> ({filteredZones.length} of {zones.length} sectors shown)
            </span>
          </div>
          <button
            type="button"
            onClick={() => setSummaryFilter('ALL')}
            className="flex items-center gap-1 font-bold text-sky-700 hover:text-sky-950 underline cursor-pointer"
          >
            <X className="size-3" />
            Show all sectors
          </button>
        </div>
      )}

      <EmergencyResponsePanel alerts={alerts} selectedZone={selectedZone} />

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
            zones={filteredZones}
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
            zones={filteredZones}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={(z) => setSelectedZone(z)}
          />
        </div>
      </div>

      {/* Lower Section: Alerts Feed + Citizen & Field Reports */}
      <div id="alerts-feed-section" className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AlertsPanel initialAlerts={alerts} onAcknowledgeAlert={handleAlertAcknowledged} />

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
                  <span>{rep.status === 'verified' || rep.verified ? '✓ Human Verified' : 'Pending Human Review'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
