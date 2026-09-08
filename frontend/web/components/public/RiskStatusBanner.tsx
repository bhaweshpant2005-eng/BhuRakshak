'use client';

import { useEffect, useState } from 'react';
import { getDashboardSummary } from '@/lib/api/services';
import { DashboardSummary } from '@/lib/api/types';
import { AlertCircle, ShieldAlert, Activity, CheckCircle2 } from 'lucide-react';

export default function RiskStatusBanner() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    getDashboardSummary().then(setSummary);
  }, []);

  if (!summary) return null;

  return (
    <div className="bg-sky-50 border-y border-sky-100 py-3 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
          </span>
          <span className="text-slate-700 font-semibold">Live NER Status:</span>
        </div>

        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-red-500" />
            <span className="text-slate-500">Critical Zones:</span>
            <span className="text-red-600 font-bold text-sm">{summary.critical_zones}</span>
          </div>

          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-slate-500">High Zones:</span>
            <span className="text-amber-700 font-bold text-sm">{summary.high_zones}</span>
          </div>

          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            <span className="text-slate-500">Active Alerts:</span>
            <span className="text-sky-700 font-bold text-sm">{summary.active_alerts}</span>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-sky-600" />
            <span className="text-slate-500">Monitored Zones:</span>
            <span className="text-sky-700 font-bold text-sm">{summary.total_zones}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
