import { DashboardSummary } from '@/lib/api/types';
import { ShieldAlert, AlertTriangle, BellRing, Home, Navigation, Activity } from 'lucide-react';

export default function SummaryCards({ summary }: { summary: DashboardSummary }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
      {/* Critical Card */}
      <div className="bg-gradient-to-br from-red-950/40 to-slate-900 border border-red-500/40 rounded-xl p-4 space-y-2 shadow-lg shadow-red-950/20">
        <div className="flex items-center justify-between text-red-400">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">Critical Zones</span>
          <ShieldAlert className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white">{summary.critical_zones}</span>
          <span className="text-[11px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/30">
            Score &gt;75
          </span>
        </div>
        <p className="text-[11px] text-slate-400">Evacuation alerts active</p>
      </div>

      {/* High Risk Card */}
      <div className="bg-gradient-to-br from-orange-950/40 to-slate-900 border border-orange-500/40 rounded-xl p-4 space-y-2 shadow-lg shadow-orange-950/20">
        <div className="flex items-center justify-between text-orange-400">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">High Risk</span>
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white">{summary.high_zones}</span>
          <span className="text-[11px] font-mono text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded border border-orange-500/30">
            Score 51–75
          </span>
        </div>
        <p className="text-[11px] text-slate-400">High standby status</p>
      </div>

      {/* Active Alerts */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-amber-400">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">Active Alerts</span>
          <BellRing className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white">{summary.active_alerts}</span>
          <span className="text-[11px] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/30">
            Live Feed
          </span>
        </div>
        <p className="text-[11px] text-slate-400">Dispatch alerts issued</p>
      </div>

      {/* High Risk Villages */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-blue-400">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">Vulnerable Villages</span>
          <Home className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white">{summary.high_risk_villages}</span>
          <span className="text-[11px] font-mono text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/30">
            In Sector
          </span>
        </div>
        <p className="text-[11px] text-slate-400">Habitations monitored</p>
      </div>

      {/* Blocked Roads */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-2">
        <div className="flex items-center justify-between text-purple-400">
          <span className="text-xs font-mono uppercase tracking-wider font-semibold">Highway Blockages</span>
          <Navigation className="w-5 h-5" />
        </div>
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-extrabold text-white">{summary.blocked_roads_count}</span>
          <span className="text-[11px] font-mono text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded border border-purple-500/30">
            NH / SH
          </span>
        </div>
        <p className="text-[11px] text-slate-400">Rerouting operational</p>
      </div>
    </div>
  );
}
