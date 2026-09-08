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
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="size-9 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700">
            <ShieldAlert className="size-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-lg text-slate-950 flex items-center gap-2">
              <span>Bhu-Rakshak</span>
              <span className="hidden sm:inline text-[10px] font-mono px-2 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                Disaster Control Room
              </span>
            </h1>
            <p className="text-[11px] text-slate-500">North Eastern State & District Authority Operations</p>
          </div>
        </Link>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden md:flex items-center gap-2 text-xs font-mono text-slate-500 bg-slate-50 px-3 py-1.5 rounded border border-slate-200">
          <Clock className="w-3.5 h-3.5 text-sky-600" />
          <span>{timeStr || 'SYSTEM ACTIVE'}</span>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-white hover:bg-sky-50 text-slate-700 border border-slate-200 transition duration-200"
          >
            <RefreshCw className="w-3.5 h-3.5 text-sky-600" />
            <span>Refresh Feeds</span>
          </button>
        )}

        <Link
          href="/dashboard/alerts"
          aria-label="View active alerts"
          className="relative p-2 rounded-lg bg-white text-slate-600 hover:text-sky-700 hover:bg-sky-50 border border-slate-200 transition duration-200"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-red-500"></span>
        </Link>
      </div>
    </header>
  );
}
