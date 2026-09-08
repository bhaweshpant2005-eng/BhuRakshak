import { DashboardSummary } from '@/lib/api/types';
import { ShieldAlert, AlertTriangle, BellRing, Home, Navigation, Activity } from 'lucide-react';

export type SummaryFilter = 'ALL' | 'CRITICAL' | 'HIGH' | 'ALERTS' | 'VILLAGES' | 'ROADS';

export default function SummaryCards({
  summary,
  activeFilter = 'ALL',
  onFilterChange,
}: {
  summary: DashboardSummary;
  activeFilter?: SummaryFilter;
  onFilterChange?: (filter: SummaryFilter) => void;
}) {
  const handleClick = (filter: SummaryFilter) => {
    if (onFilterChange) {
      onFilterChange(activeFilter === filter ? 'ALL' : filter);
    }
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Critical Card */}
      <div
        onClick={() => handleClick('CRITICAL')}
        role="button"
        tabIndex={0}
        title="Click to filter by Critical risk zones"
        className={`rounded-xl border p-4 space-y-2 shadow-sm transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5 ${
          activeFilter === 'CRITICAL'
            ? 'border-red-500 bg-red-100/70 ring-2 ring-red-500 shadow-md'
            : 'border-red-200 bg-red-50 hover:bg-red-100/50'
        }`}
      >
        <div className="flex items-center justify-between text-red-700">
          <span className="text-xs font-mono font-semibold">Critical Zones</span>
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-950 tabular-nums">{summary.critical_zones}</span>
          <span className="text-[11px] font-mono text-red-700 bg-white px-1.5 py-0.5 rounded border border-red-200">
            Score &gt;75
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span>Evacuation alerts active</span>
          {activeFilter === 'CRITICAL' && <span className="font-bold text-red-700">&bull; Active Filter</span>}
        </div>
      </div>

      {/* High Risk Card */}
      <div
        onClick={() => handleClick('HIGH')}
        role="button"
        tabIndex={0}
        title="Click to filter by High risk zones"
        className={`rounded-xl border p-4 space-y-2 shadow-sm transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5 ${
          activeFilter === 'HIGH'
            ? 'border-amber-500 bg-amber-100/70 ring-2 ring-amber-500 shadow-md'
            : 'border-amber-200 bg-amber-50 hover:bg-amber-100/50'
        }`}
      >
        <div className="flex items-center justify-between text-amber-700">
          <span className="text-xs font-mono font-semibold">High Risk</span>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-950 tabular-nums">{summary.high_zones}</span>
          <span className="text-[11px] font-mono text-amber-700 bg-white px-1.5 py-0.5 rounded border border-amber-200">
            Score 51–75
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span>High standby status</span>
          {activeFilter === 'HIGH' && <span className="font-bold text-amber-700">&bull; Active Filter</span>}
        </div>
      </div>

      {/* Active Alerts */}
      <div
        onClick={() => handleClick('ALERTS')}
        role="button"
        tabIndex={0}
        title="Click to focus on Active Alerts"
        className={`surface-card p-4 space-y-2 transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5 ${
          activeFilter === 'ALERTS'
            ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500 shadow-md'
            : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-sky-700">
          <span className="text-xs font-mono font-semibold">Active Alerts</span>
          <BellRing className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-950 tabular-nums">{summary.active_alerts}</span>
          <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
            Live Feed
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Dispatch alerts issued</span>
          {activeFilter === 'ALERTS' && <span className="font-bold text-sky-700">&bull; Focused</span>}
        </div>
      </div>

      {/* High Risk Villages */}
      <div
        onClick={() => handleClick('VILLAGES')}
        role="button"
        tabIndex={0}
        title="Click to view sectors with vulnerable villages"
        className={`surface-card p-4 space-y-2 transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5 ${
          activeFilter === 'VILLAGES'
            ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500 shadow-md'
            : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-sky-700">
          <span className="text-xs font-mono font-semibold">Vulnerable Villages</span>
          <Home className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-950 tabular-nums">{summary.high_risk_villages}</span>
          <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
            In Sector
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Habitations monitored</span>
          {activeFilter === 'VILLAGES' && <span className="font-bold text-sky-700">&bull; Filtered</span>}
        </div>
      </div>

      {/* Blocked Roads */}
      <div
        onClick={() => handleClick('ROADS')}
        role="button"
        tabIndex={0}
        title="Click to view sectors with affected roads"
        className={`surface-card p-4 space-y-2 transition-all duration-200 cursor-pointer select-none hover:-translate-y-0.5 ${
          activeFilter === 'ROADS'
            ? 'border-sky-500 bg-sky-50/80 ring-2 ring-sky-500 shadow-md'
            : 'hover:bg-slate-50'
        }`}
      >
        <div className="flex items-center justify-between text-sky-700">
          <span className="text-xs font-mono font-semibold">Highway Blockages</span>
          <Navigation className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-slate-950 tabular-nums">{summary.blocked_roads_count}</span>
          <span className="text-[11px] font-mono text-sky-700 bg-sky-50 px-1.5 py-0.5 rounded border border-sky-100">
            NH / SH
          </span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Rerouting operational</span>
          {activeFilter === 'ROADS' && <span className="font-bold text-sky-700">&bull; Filtered</span>}
        </div>
      </div>
    </div>
  );
}
