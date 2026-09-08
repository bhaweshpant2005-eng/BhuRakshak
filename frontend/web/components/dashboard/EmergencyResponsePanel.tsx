'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Alert, RiskZone } from '@/lib/api/types';
import {
  Ambulance,
  BellRing,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Download,
  Phone,
  TriangleAlert,
} from 'lucide-react';

type ResponseTaskId = 'medical' | 'authority' | 'warning';
type ResponseProgress = Partial<Record<ResponseTaskId, string>>;

const responseSteps: Array<{
  id: ResponseTaskId;
  title: string;
  detail: string;
  icon: typeof Ambulance;
}> = [
  {
    id: 'medical',
    title: 'Medical support',
    detail: 'Confirm ambulance and primary health-centre availability before teams enter the affected corridor.',
    icon: Ambulance,
  },
  {
    id: 'authority',
    title: 'Authority escalation',
    detail: 'Record that the incident brief was shared with the DDMA, SDRF, and local police control room.',
    icon: Building2,
  },
  {
    id: 'warning',
    title: 'Warning simulation',
    detail: 'Record that evacuation and road-access messages were prepared for authority review. This does not send a public warning.',
    icon: BellRing,
  },
];

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

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey(zoneId));
    setProgress(saved ? JSON.parse(saved) as ResponseProgress : {});
    setIsReady(true);
  }, [zoneId]);

  const completedCount = useMemo(
    () => responseSteps.filter((step) => progress[step.id]).length,
    [progress],
  );

  const saveProgress = (nextProgress: ResponseProgress) => {
    setProgress(nextProgress);
    window.localStorage.setItem(storageKey(zoneId), JSON.stringify(nextProgress));
  };

  const toggleTask = (taskId: ResponseTaskId) => {
    const nextProgress = { ...progress };
    if (nextProgress[taskId]) {
      delete nextProgress[taskId];
    } else {
      nextProgress[taskId] = new Date().toISOString();
    }
    saveProgress(nextProgress);
  };

  const downloadBrief = () => {
    const completedActions = responseSteps
      .filter((step) => progress[step.id])
      .map((step) => `- ${step.title}: recorded ${new Date(progress[step.id] as string).toLocaleString()}`)
      .join('\n') || '- No response actions have been recorded yet.';
    const brief = [
      'BHŪ-RAKSHAK INCIDENT BRIEF',
      `Sector: ${sectorName}`,
      `Alert: ${activeAlert?.title ?? 'No active alert selected'}`,
      `Generated: ${new Date().toLocaleString()}`,
      '',
      'Recorded response actions',
      completedActions,
      '',
      `Affected villages: ${affectedVillages.join(', ') || 'Not available'}`,
      `Affected roads: ${affectedRoads.join(', ') || 'Not available'}`,
      '',
      'Reminder: Confirm all dispatches and notifications through official emergency channels.',
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

        <div className="flex flex-wrap gap-2 lg:justify-end">
          <a href="tel:112" className="button-primary px-4 py-2.5">
            <Phone className="size-4" />
            Call emergency services
          </a>
          <button type="button" onClick={downloadBrief} className="button-secondary px-4 py-2.5">
            <Download className="size-4" />
            Download brief
          </button>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-sm text-slate-600">
        <ClipboardCheck className="size-4 text-sky-700" />
        <span className="tabular-nums">{isReady ? `${completedCount} of ${responseSteps.length} actions recorded` : 'Loading response log…'}</span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        {responseSteps.map((step) => {
          const Icon = step.icon;
          const completedAt = progress[step.id];
          return (
            <div key={step.id} className="rounded-lg border border-sky-100 bg-white p-4">
              <Icon className="size-5 text-sky-700" />
              <h3 className="text-balance mt-3 text-sm font-semibold text-slate-950">{step.title}</h3>
              <p className="text-pretty mt-1.5 text-xs leading-5 text-slate-600">{step.detail}</p>
              <button
                type="button"
                onClick={() => toggleTask(step.id)}
                className={completedAt ? 'button-secondary mt-4 w-full justify-center px-3 py-2 text-xs' : 'button-primary mt-4 w-full justify-center px-3 py-2 text-xs'}
              >
                {completedAt && <CheckCircle2 className="size-4" />}
                {completedAt ? `Recorded ${new Date(completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Record action'}
              </button>
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
