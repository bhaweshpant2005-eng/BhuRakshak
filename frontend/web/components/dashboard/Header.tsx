'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, Bell, Clock, RefreshCw, Layers } from 'lucide-react';

export default function DashboardHeader({ onRefresh }: { onRefresh?: () => void }) {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg tracking-tight text-white flex items-center gap-2">
              <span>NER-SENTRY</span>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-800/60">
                Disaster Control Room
              </span>
            </h1>
            <p className="text-[11px] text-slate-400">North Eastern State & District Authority Operations</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
          <Clock className="w-3.5 h-3.5 text-amber-400" />
          <span>{timeStr || 'SYSTEM ACTIVE'}</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            <span>Refresh Feeds</span>
          </button>
        )}

        <Link
          href="/dashboard/alerts"
          className="relative p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 transition"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
        </Link>
      </div>
    </header>
  );
}
