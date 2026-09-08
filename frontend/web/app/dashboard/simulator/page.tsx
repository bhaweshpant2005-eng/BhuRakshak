'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { RiskZone } from '@/lib/api/types';
import { getRiskZones } from '@/lib/api/services';
import WhatIfSimulator from '@/components/dashboard/WhatIfSimulator';
import { SlidersHorizontal } from 'lucide-react';

export default function SimulatorPage() {
  const searchParams = useSearchParams();
  const zoneIdParam = searchParams.get('zone_id');

  const [zones, setZones] = useState<RiskZone[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getRiskZones().then((data) => {
      setZones(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500 font-mono text-xs">
        Loading Scenario Simulation Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-950 flex items-center gap-2">
            <SlidersHorizontal className="w-6 h-6 text-amber-500" />
            <span>Interactive Scenario Simulator</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Simulate rainfall surges and forecast landslide risk escalation, affected habitations, and highway closures
          </p>
        </div>
      </div>

      <WhatIfSimulator zones={zones} initialZoneId={zoneIdParam || undefined} />
    </div>
  );
}
