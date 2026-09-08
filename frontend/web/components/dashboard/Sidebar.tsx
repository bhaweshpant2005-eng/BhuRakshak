'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, SlidersHorizontal, Bell, BarChart2, Globe } from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Control Overview', icon: LayoutDashboard },
    { href: '/dashboard/zones', label: 'Risk Zones & Map', icon: MapPin },
    { href: '/dashboard/simulator', label: 'What-If Simulator', icon: SlidersHorizontal, highlight: true },
    { href: '/dashboard/alerts', label: 'Alert Dispatch', icon: Bell },
    { href: '/dashboard/analytics', label: 'Historical Analytics', icon: BarChart2 },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between min-h-[calc(100vh-57px)]">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold mb-2">
            Control Room Navigation
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 border border-slate-700 font-bold'
                    : item.highlight
                    ? 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/30'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                    Hero
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-800 space-y-2">
          <p className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-500 font-semibold mb-1">
            System Operations
          </p>
          <Link
            href="/landing"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800/40 transition"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Public Portal View</span>
          </Link>
        </div>
      </div>

      {/* System Status Box */}
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">AI Model Status:</span>
            <span className="text-emerald-400 font-mono font-bold">ONLINE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">GIS Engine:</span>
            <span className="text-emerald-400 font-mono font-bold">READY</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Coverage:</span>
            <span className="text-slate-200 font-mono font-bold">8 NER States</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
