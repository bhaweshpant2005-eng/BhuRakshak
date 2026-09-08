'use client';

import { useEffect, useState } from 'react';
import { Alert } from '@/lib/api/types';
import { getAlerts } from '@/lib/api/services';
import AlertsPanel from '@/components/dashboard/AlertsPanel';
import { Bell } from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getAlerts().then((data) => {
      setAlerts(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading Alerts Feed...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Bell className="w-6 h-6 text-red-500" />
            <span>Disaster Warning & Alert Dispatch Center</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Review active emergency warnings, acknowledge alerts, and trigger evacuation notices
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        <AlertsPanel initialAlerts={alerts} />
      </div>
    </div>
  );
}
