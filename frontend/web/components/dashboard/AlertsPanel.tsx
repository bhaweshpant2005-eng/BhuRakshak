'use client';

import { useState } from 'react';
import { Alert } from '@/lib/api/types';
import { acknowledgeAlert } from '@/lib/api/services';
import { formatDate } from '@/lib/utils/formatters';
import { getRiskBadgeClasses } from '@/lib/utils/riskUtils';
import { Bell, CheckCircle2, AlertOctagon, ShieldAlert } from 'lucide-react';

export default function AlertsPanel({
  initialAlerts,
  onAcknowledgeAlert,
}: {
  initialAlerts: Alert[];
  onAcknowledgeAlert?: (id: string) => void;
}) {
  const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);

  const handleAcknowledge = async (id: string) => {
    const updated = await acknowledgeAlert(id);
    if (updated) {
      setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a)));
      onAcknowledgeAlert?.(id);
    }
  };

  return (
    <div className="surface-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-sky-700" />
          <h2 className="font-bold text-slate-950 text-base">Alert Drafts & Simulations</h2>
        </div>
        <span className="text-xs font-mono bg-red-50 text-red-700 px-2 py-0.5 rounded border border-red-200 tabular-nums">
          {alerts.filter((a) => !a.acknowledged).length} Unacknowledged
        </span>
      </div>

      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[500px]">
        {alerts.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No active emergency alerts in feed.</div>
        ) : (
          alerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-4 space-y-3 transition duration-200 ${
                alert.acknowledged ? 'bg-slate-50 opacity-70' : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded border ${getRiskBadgeClasses(alert.severity)}`}>
                      {alert.severity}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{formatDate(alert.timestamp)}</span>
                  </div>
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {alert.severity === 'CRITICAL' && <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />}
                    <span>{alert.title}</span>
                  </h3>
                  <p className="text-xs text-sky-700 font-mono">Sector: {alert.zone_name}</p>
                </div>
              </div>

              <p className="text-pretty text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded border border-slate-100">
                {alert.description}
              </p>

              <div className="flex items-center justify-between pt-1">
                {alert.evacuation_recommended ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/30">
                    <AlertOctagon className="w-3.5 h-3.5" />
                    <span>{alert.status === 'approved_simulation' ? 'SIMULATION: EVACUATION RECOMMENDED' : 'EVACUATION DRAFT'}</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-500">High Monitoring</span>
                )}

                {alert.acknowledged ? (
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>ACKNOWLEDGED</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    className="button-primary px-3 py-1 text-xs"
                  >
                    Acknowledge Alert
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
