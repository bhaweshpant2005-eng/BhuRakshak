'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShieldAlert, Map, Info, BookOpen, ShieldCheck } from 'lucide-react';

export default function PublicNavbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/about', label: 'About & Terrain', icon: Info },
    { href: '/how-it-works', label: 'How It Works', icon: BookOpen },
    { href: '/features', label: 'Platform Features', icon: Map },
    { href: '/safety', label: 'Public Safety', icon: ShieldCheck },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center gap-8">
        <Link href="/landing" className="flex items-center gap-3 group">
          <div className="size-10 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center text-sky-700 transition duration-200 group-hover:-translate-y-0.5 group-hover:bg-sky-200">
            <ShieldAlert className="size-5" />
          </div>
          <span className="font-bold text-xl text-slate-950">Bhu-Rakshak</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex flex-1 items-center justify-evenly gap-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                  isActive
                    ? 'bg-sky-50 text-sky-700 border border-sky-100'
                    : 'text-slate-600 hover:text-sky-700 hover:bg-sky-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>

      </div>
    </header>
  );
}
