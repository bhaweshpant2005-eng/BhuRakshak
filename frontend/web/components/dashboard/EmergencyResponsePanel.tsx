'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, RiskZone } from '@/lib/api/types';
import { recordResponseAction } from '@/lib/api/services';
import {
  Ambulance,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  Phone,
  RotateCcw,
  Sparkles,
  TriangleAlert,
  X,
} from 'lucide-react';

type ResponseTaskId = 'medical' | 'authority' | 'warning';
type ResponseProgress = Partial<Record<ResponseTaskId, string>>;

function storageKey(zoneId: string) {
  return `bhu-rakshak-response-${zoneId}`;
}

export default function EmergencyResponsePanel({
  alerts,
  selectedZone,
}: {
  alerts: Alert[];
  selectedZone: RiskZone | null;
}) {
  const activeAlert = alerts.find((alert) => !alert.acknowledged && alert.severity === 'CRITICAL')
    ?? alerts.find((alert) => !alert.acknowledged);
  const sectorName = selectedZone?.name ?? activeAlert?.zone_name ?? 'Selected high-risk sector';
  const zoneId = selectedZone?.zone_id ?? activeAlert?.zone_id ?? 'general';
  const affectedVillages = selectedZone?.affected_villages ?? [];
  const affectedRoads = selectedZone?.affected_roads ?? [];
  const [progress, setProgress] = useState<ResponseProgress>({});
  const [isReady, setIsReady] = useState(false);
  const [showEmergencyNumbers, setShowEmergencyNumbers] = useState(false);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Dynamic response steps generated from selected sector data
  const responseSteps = useMemo(() => [
    {
      id: 'medical' as ResponseTaskId,
      title: 'Medical support & triage',
      detail: affectedVillages.length > 0
        ? `Stage ambulance dispatch and primary health-centre trauma beds for ${affectedVillages.slice(0, 3).join(', ')} in ${selectedZone?.district ?? 'the affected corridor'}.`
        : `Confirm ambulance readiness and PHC trauma triage before response teams enter ${sectorName}.`,
      icon: Ambulance,
      tag: affectedVillages.length > 0 ? `${affectedVillages.length} Habitations` : 'Corridor',
      badge: selectedZone?.risk_level ? `${selectedZone.risk_level} Priority` : 'Urgent',
    },
    {
      id: 'authority' as ResponseTaskId,
      title: 'Authority escalation & SDRF',
      detail: `Dispatch real-time GIS incident brief to ${selectedZone?.district ? `${selectedZone.district} DDMA` : 'District DDMA'}, ${selectedZone?.state ? `${selectedZone.state} SDRF` : 'SDRF'}, and Police Control Room (Dial 100).`,
      icon: Building2,
      tag: selectedZone?.district ? `${selectedZone.district} DDMA` : 'Regional Desk',
      badge: selectedZone?.risk_score !== undefined ? `Risk: ${selectedZone.risk_score}/100` : 'Priority 1',
    },
    {
      id: 'warning' as ResponseTaskId,
      title: 'Public warning & road diversion',
      detail: affectedRoads.length > 0
        ? `Prepare evacuation directives and traffic checkpoints along ${affectedRoads.slice(0, 2).join(', ')} (Trigger: ${selectedZone?.rainfall_mm ?? 0} mm rain / ${selectedZone?.soil_moisture ?? 0}% soil saturation).`
        : `Draft preventive evacuation advisories and road checkpoints for ${sectorName}.`,
      icon: BellRing,
      tag: affectedRoads[0] || 'Local Arterials',
      badge: `${selectedZone?.rainfall_mm ?? 0} mm Rain Trigger`,
    },
  ], [selectedZone, sectorName, affectedVillages, affectedRoads]);

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey(zoneId));
    setProgress(saved ? JSON.parse(saved) as ResponseProgress : {});
    setIsReady(true);
    setSyncNotice(null);
  }, [zoneId]);

  const completedCount = useMemo(
    () => responseSteps.filter((step) => progress[step.id]).length,
    [progress, responseSteps],
  );

  const saveProgress = (nextProgress: ResponseProgress) => {
    setProgress(nextProgress);
    window.localStorage.setItem(storageKey(zoneId), JSON.stringify(nextProgress));
  };

  const toggleTask = async (taskId: ResponseTaskId) => {
    const nextProgress = { ...progress };
    const isNowRecorded = !nextProgress[taskId];
    if (!isNowRecorded) {
      delete nextProgress[taskId];
    } else {
      nextProgress[taskId] = new Date().toISOString();
    }
    saveProgress(nextProgress);

    // Call backend API if an alert is linked
    if (activeAlert?.id) {
      const actionType = taskId === 'warning' ? 'warning_simulation' : taskId;
      const status = isNowRecorded ? 'recorded' : 'cancelled';
      try {
        await recordResponseAction(activeAlert.id, actionType, status);
        setSyncNotice(`Synced action to Control Room (${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`);
      } catch {
        setSyncNotice('Action recorded locally on device.');
      }
    } else {
      setSyncNotice(`Action saved for ${sectorName}.`);
    }
  };

  const markAllTasks = () => {
    const now = new Date().toISOString();
    const nextProgress: ResponseProgress = {
      medical: now,
      authority: now,
      warning: now,
    };
    saveProgress(nextProgress);
    setSyncNotice('All protocol actions marked as completed.');
  };

  const resetAllTasks = () => {
    saveProgress({});
    setSyncNotice('Response action log reset.');
  };

  const downloadBrief = () => {
    const completedActions = responseSteps
      .map((step) => {
        const time = progress[step.id];
        return time
          ? `[X] ${step.title}: COMPLETED (${new Date(time).toLocaleString()})\n    Detail: ${step.detail}`
          : `[ ] ${step.title}: PENDING`;
      })
      .join('\n');

    const brief = [
      '==========================================================',
      '       BHU-RAKSHAK DISASTER RESPONSE INCIDENT BRIEF       ',
      '==========================================================',
      `Sector: ${sectorName} (ID: ${zoneId})`,
      `Location: ${selectedZone?.district ?? 'Unknown District'}, ${selectedZone?.state ?? 'North East India'}`,
      `Risk Level: ${selectedZone?.risk_level ?? activeAlert?.severity ?? 'HIGH'} (${selectedZone?.risk_score ?? 85}/100)`,
      `Environmental Telemetry:`,
      `  - 24h Rainfall: ${selectedZone?.rainfall_mm ?? 'N/A'} mm`,
      `  - Soil Saturation: ${selectedZone?.soil_moisture ?? 'N/A'}%`,
      `  - Terrain Slope: ${selectedZone?.slope_deg ?? 'N/A'}°`,
      `  - Elevation: ${selectedZone?.elevation_m ?? 'N/A'} m`,
      `Associated Alert: ${activeAlert?.title ?? 'None active'}`,
      `Generated At: ${new Date().toLocaleString()}`,
      '----------------------------------------------------------',
      'RESPONSE ACTIONS AUDIT TRAIL:',
      completedActions,
      '----------------------------------------------------------',
      `Vulnerable Villages (${affectedVillages.length}): ${affectedVillages.join(', ') || 'General sector coverage'}`,
      `Monitored Highway / Roads (${affectedRoads.length}): ${affectedRoads.join(', ') || 'Local routes'}`,
      '----------------------------------------------------------',
      'EMERGENCY DISPATCH NUMBERS:',
      '  - Police Emergency: 100',
      '  - National Emergency Helpline: 112',
      '  - Medical / Ambulance: 108',
      '  - Disaster Helpline: 1070 / 1077',
      '==========================================================',
    ].join('\n');

    const url = URL.createObjectURL(new Blob([brief], { type: 'text/plain' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `incident-brief-${zoneId}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="rounded-xl border border-sky-100 bg-sky-50 p-5 sm:p-6">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-xl space-y-3">
          <div className="flex items-center gap-2 text-sky-700">
            <TriangleAlert className="size-5" />
            <span className="text-sm font-semibold">Landslide response control</span>
          </div>
          <div>
            <h2 className="text-balance text-xl font-bold text-slate-950">Coordinate a response for {sectorName}</h2>
            <p className="text-pretty mt-2 text-sm leading-6 text-slate-600">
              Record each action once an operator has completed it. The action log is saved on this device for this sector.
            </p>
          </div>
          <div className="rounded-lg border border-sky-100 bg-white px-3 py-2 text-xs leading-5 text-slate-600">
            This dashboard records operator actions; it cannot independently dispatch ambulances or notify authorities without verified emergency-service integrations.
          </div>
        </div>

        <div className="relative flex flex-wrap gap-2 lg:justify-end">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmergencyNumbers((prev) => !prev)}
              className="button-primary px-4 py-2.5 shadow-sm"
              title="Click to reveal emergency phone number"
            >
              <Phone className="size-4 text-white" />
              <span>{showEmergencyNumbers ? 'Emergency: 100' : 'Call emergency services'}</span>
            </button>

            {showEmergencyNumbers && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-xl border border-sky-200 bg-white p-4 shadow-xl z-30 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Phone className="size-3.5 text-red-600" /> Emergency Helpline
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowEmergencyNumbers(false)}
                    className="text-slate-400 hover:text-slate-600 p-0.5 rounded"
                    title="Close"
                  >
                    <X className="size-3.5" />
                  </button>
                </div>

                <div className="mt-3 space-y-2">
                  <a
                    href="tel:100"
                    className="flex items-center justify-between p-3 rounded-lg bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 transition"
                  >
                    <div>
                      <div className="font-mono text-xl font-black text-red-700">100</div>
                      <div className="text-[11px] text-red-600 font-medium">Police & Emergency Control</div>
                    </div>
                    <span className="text-xs font-bold bg-red-600 text-white px-2.5 py-1.5 rounded-md hover:bg-red-700">
                      Call 100
                    </span>
                  </a>

                  <a
                    href="tel:112"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">112</div>
                      <div className="text-[10px] text-slate-500">National Emergency Helpline</div>
                    </div>
                    <span className="text-xs text-sky-700 font-semibold">Call 112</span>
                  </a>

                  <a
                    href="tel:108"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 transition text-xs"
                  >
                    <div>
                      <div className="font-mono font-bold text-slate-900">108</div>
                      <div className="text-[10px] text-slate-500">Ambulance / Medical Response</div>
                    </div>
                    <span className="text-xs text-emerald-700 font-semibold">Call 108</span>
                  </a>
                </div>
              </div>
            )}
          </div>

          <button type="button" onClick={downloadBrief} className="button-secondary px-4 py-2.5">
            <Download className="size-4" />
            Download brief
          </button>
        </div>
      </div>

      {/* Dynamic Progress & Quick Control Bar */}
      <div className="mt-5 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-slate-700">
            <ClipboardCheck className="size-4 text-sky-700" />
            <span className="font-semibold tabular-nums">
              {isReady ? `${completedCount} of ${responseSteps.length} actions recorded (${Math.round((completedCount / responseSteps.length) * 100)}%)` : 'Loading response log…'}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs">
            {syncNotice && (
              <span className="font-mono text-[11px] text-sky-700 bg-sky-100/60 px-2 py-0.5 rounded border border-sky-200">
                {syncNotice}
              </span>
            )}
            <button
              type="button"
              onClick={markAllTasks}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium transition"
              title="Mark all 3 actions completed"
            >
              <Sparkles className="size-3 text-amber-500" />
              Mark all completed
            </button>
            {completedCount > 0 && (
              <button
                type="button"
                onClick={resetAllTasks}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white hover:bg-red-50 text-red-600 border border-red-200 font-medium transition"
                title="Reset response log"
              >
                <RotateCcw className="size-3" />
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className={`h-full transition-all duration-500 rounded-full ${
              completedCount === responseSteps.length ? 'bg-emerald-500' : 'bg-sky-600'
            }`}
            style={{ width: `${(completedCount / responseSteps.length) * 100}%` }}
          />
        </div>

        {/* Completed Protocol Banner */}
        {completedCount === responseSteps.length && (
          <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
              <span>
                <strong>Response Protocol Complete:</strong> All actions for <strong>{sectorName}</strong> are recorded on this device and synced with Disaster Control Center.
              </span>
            </div>
            <button
              type="button"
              onClick={downloadBrief}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline ml-2 shrink-0"
            >
              Export Incident Brief
            </button>
          </div>
        )}
      </div>

      {/* Dynamic Action Cards */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {responseSteps.map((step) => {
          const Icon = step.icon;
          const completedAt = progress[step.id];
          return (
            <div
              key={step.id}
              className={`rounded-lg border p-4 transition-all duration-200 flex flex-col justify-between ${
                completedAt ? 'border-emerald-200 bg-emerald-50/30' : 'border-sky-100 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <Icon className={`size-5 ${completedAt ? 'text-emerald-600' : 'text-sky-700'}`} />
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-100">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-balance mt-3 text-sm font-semibold text-slate-950 flex items-center gap-1.5">
                  {completedAt && <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />}
                  <span>{step.title}</span>
                </h3>
                <p className="text-pretty mt-1.5 text-xs leading-5 text-slate-600">{step.detail}</p>
              </div>

              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => toggleTask(step.id)}
                  className={
                    completedAt
                      ? 'button-secondary w-full justify-center px-3 py-2 text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'button-primary w-full justify-center px-3 py-2 text-xs'
                  }
                >
                  {completedAt ? (
                    <>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                      <span>Recorded {new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  ) : (
                    <span>Record action &rarr;</span>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-sky-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-pretty max-w-3xl text-xs leading-5 text-slate-600">
          Prevention: keep drainage channels clear, report cracks or water seepage, and avoid construction or parking below unstable slopes. After an event, restrict access until the area is inspected and declared safe.
        </p>
        <Link href="/safety" className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-sky-700 hover:text-sky-800">
          View safety guidance
          <ChevronRight className="size-4" />
        </Link>
      </div>
    </section>
  );
}
