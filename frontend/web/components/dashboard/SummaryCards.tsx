import { DashboardSummary } from '@/lib/api/types';
import { ShieldAlert, AlertTriangle, BellRing, Home, Navigation, Activity } from 'lucide-react';

export default function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Critical Card */}
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 space-y-2 shadow-sm">
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
        <p className="text-[11px] text-slate-600">Evacuation alerts active</p>
      </div>

      {/* High Risk Card */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 space-y-2 shadow-sm">
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
        <p className="text-[11px] text-slate-600">High standby status</p>
      </div>

      {/* Active Alerts */}
      <div className="surface-card p-4 space-y-2">
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
        <p className="text-[11px] text-slate-500">Dispatch alerts issued</p>
      </div>

      {/* High Risk Villages */}
      <div className="surface-card p-4 space-y-2">
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
        <p className="text-[11px] text-slate-500">Habitations monitored</p>
      </div>

      {/* Blocked Roads */}
      <div className="surface-card p-4 space-y-2">
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
        <p className="text-[11px] text-slate-500">Rerouting operational</p>
      </div>
    </div>
  );
}
