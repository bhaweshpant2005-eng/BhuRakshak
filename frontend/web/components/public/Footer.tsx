import Link from 'next/link';
import { ShieldAlert, Globe, PhoneCall } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            <span>Bhu-Rakshak</span>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            AI-based Landslide Risk Prediction, Early Warning & Decision Support System designed for the North Eastern Region of India.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/landing" className="hover:text-amber-400 transition">Landing Home</Link></li>
            <li><Link href="/about" className="hover:text-amber-400 transition">NER Terrain & Problem</Link></li>
            <li><Link href="/how-it-works" className="hover:text-amber-400 transition">AI Model & Data Pipeline</Link></li>
            <li><Link href="/features" className="hover:text-amber-400 transition">Platform Capabilities</Link></li>
            <li><Link href="/safety" className="hover:text-amber-400 transition">Evacuation & Safety</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Authority Control</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/dashboard" className="text-red-400 hover:text-red-300 font-medium">Control Room Dashboard</Link></li>
            <li><Link href="/dashboard/zones" className="hover:text-amber-400 transition">Risk Zones Overview</Link></li>
            <li><Link href="/dashboard/simulator" className="hover:text-amber-400 transition">What-If Risk Simulator</Link></li>
            <li><Link href="/dashboard/alerts" className="hover:text-amber-400 transition">Active Disaster Alerts</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">NER Emergency Contacts</h4>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-2 text-red-400">
              <PhoneCall className="w-4 h-4" />
              <span>NDRF Helplines: 1078 / 011-24363260</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>SDMA Helpline (Assam/Meghalaya): 1070</span>
            </div>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-900">
              Powered by Multi-Source Rainfall APIs & AI Slope Physics Engine.
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
        © 2026 Bhu-Rakshak Hackathon Team. Official Decision Support Platform for North East India.
      </div>
    </footer>
  );
}
