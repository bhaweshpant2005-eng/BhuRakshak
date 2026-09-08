'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Map, AlertTriangle, Info, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export default function PublicNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/landing', label: 'Home', icon: ShieldAlert },
    { href: '/about', label: 'About & Terrain', icon: Info },
    { href: '/how-it-works', label: 'How It Works', icon: BookOpen },
    { href: '/features', label: 'Platform Features', icon: Map },
    { href: '/safety', label: 'Public Safety', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/landing" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-lg bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-500 group-hover:bg-red-600/30 transition">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-xl tracking-tight text-white">NER-SENTRY</span>
              <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono border border-amber-500/30">
                AI Early Warning
              </span>
            </div>
            <p className="text-xs text-slate-400">North Eastern Region Landslide Risk Platform</p>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-amber-400 border border-slate-700'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Authority Portal Button */}
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/40 transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Authority Portal</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </Link>
        </div>
      </div>
    </header>
  );
}
