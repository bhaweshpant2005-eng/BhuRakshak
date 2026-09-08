'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, SlidersHorizontal, Bell, BarChart2, Database, Globe } from 'lucide-react';

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { href: '/dashboard', label: 'Control Overview', icon: LayoutDashboard },
    { href: '/dashboard/zones', label: 'Risk Zones & Map', icon: MapPin },
    { href: '/dashboard/simulator', label: 'What-If Simulator', icon: SlidersHorizontal, highlight: true },
    { href: '/dashboard/alerts', label: 'Alert Simulations', icon: Bell },
    { href: '/dashboard/sources', label: 'Data Sources', icon: Database },
    { href: '/dashboard/analytics', label: 'Historical Analytics', icon: BarChart2 },
  ];

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 flex-col justify-between min-h-[calc(100vh-57px)]">
      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-[10px] font-mono text-slate-500 font-semibold mb-2">
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
                    ? 'bg-sky-50 text-sky-700 border border-sky-100 font-bold'
                    : item.highlight
                    ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-100'
                    : 'text-slate-600 hover:bg-sky-50 hover:text-sky-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-sky-700' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </div>
                {item.highlight && !isActive && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-100 text-sky-700 font-mono">
                    Hero
                  </span>
                )}
              </Link>
            );
          })}
        </div>

        <div className="pt-4 border-t border-slate-200 space-y-2">
          <p className="px-3 text-[10px] font-mono text-slate-500 font-semibold mb-1">
            System Operations
          </p>
          <Link
            href="/landing"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-sky-700 hover:bg-sky-50 transition duration-200"
          >
            <Globe className="w-4 h-4 text-slate-500" />
            <span>Public Portal View</span>
          </Link>
        </div>
      </div>

      {/* System Status Box */}
      <div className="p-4 border-t border-slate-200">
        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Risk Engine:</span>
            <span className="text-sky-700 font-mono font-bold">EXPLAINABLE</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">GIS Engine:</span>
            <span className="text-sky-700 font-mono font-bold">READY</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Coverage:</span>
            <span className="text-slate-800 font-mono font-bold">8 NER States</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
