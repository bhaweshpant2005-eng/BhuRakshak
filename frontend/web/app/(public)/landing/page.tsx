import Link from 'next/link';
import { ShieldAlert, CloudRain, Cpu, Activity, ArrowRight, ShieldCheck, Navigation, SlidersHorizontal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-b border-slate-800">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono tracking-wide">
              <ShieldAlert className="w-4 h-4 animate-pulse" />
              <span>DISASTER MANAGEMENT & DECISION SUPPORT SYSTEM</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight">
              AI-Driven Landslide Early Warning & Risk Prediction for <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-amber-400">North East India</span>
            </h1>

            <p className="text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Transforming complex monsoon rainfall forecasts, soil moisture saturation models, steep terrain GIS topology, and historical landslide data into actionable early warnings for Disaster Management Authorities.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-950/50 transition transform hover:-translate-y-0.5"
              >
                <Activity className="w-5 h-5" />
                <span>Launch Authority Control Room</span>
              </Link>

              <Link
                href="/dashboard/simulator"
                className="flex items-center gap-2 px-6 py-3.5 rounded-lg text-base font-bold bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 transition"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Test What-If Risk Simulator</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Core Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">NER Disaster Mitigation Capabilities</h2>
          <p className="text-slate-400 text-sm mt-2">Built specifically for the 8 North Eastern States facing monsoon slope instability</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition space-y-4">
            <div className="w-12 h-12 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <CloudRain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Continuous Geo-API Ingestion</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Consolidates 24-hour accumulated rainfall forecasts, soil moisture satellite feeds, and elevation terrain maps across Assam, Sikkim, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, and Arunachal Pradesh.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition space-y-4">
            <div className="w-12 h-12 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">AI Slope Physics Risk Scoring</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Machine learning models calculate precise 0-100 risk scores and classify zones into LOW (0-25), MODERATE (26-50), HIGH (51-75), and CRITICAL (76-100) risk levels with confidence ratings.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition space-y-4">
            <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">What-If Scenario Simulator</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              Enables disaster commanders to simulate heavy rainfall scenarios (e.g. +150% rainfall for 48 hours), projecting affected villages, highway closures, and recommended evacuation timelines before landslides occur.
            </p>
          </div>
        </div>
      </section>

      {/* Target States Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-white">Monitored North Eastern Region Sectors</h3>
              <p className="text-slate-400 text-sm">Covering key arterial corridors and vulnerable settlements</p>
            </div>
            <Link
              href="/dashboard/zones"
              className="inline-flex items-center gap-2 text-sm font-semibold text-amber-400 hover:text-amber-300 transition"
            >
              <span>Explore All 32 GIS Zones</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
            {[
              { state: 'Sohra / Cherrapunjee', district: 'East Khasi Hills, Meghalaya', score: 88, status: 'CRITICAL' },
              { state: 'Gangtok Ridge South', district: 'East Sikkim, Sikkim', score: 82, status: 'CRITICAL' },
              { state: 'Kohima Bypass', district: 'Kohima, Nagaland', score: 79, status: 'CRITICAL' },
              { state: 'Kamakhya Hill Cut', district: 'Kamrup Metro, Assam', score: 76, status: 'CRITICAL' },
              { state: 'Senapati NH-39', district: 'Senapati, Manipur', score: 68, status: 'HIGH' },
              { state: 'Lunglei Ridge', district: 'Lunglei, Mizoram', score: 64, status: 'HIGH' },
              { state: 'Tawang Pass', district: 'Tawang, Arunachal', score: 72, status: 'HIGH' },
              { state: 'Unakoti Heritage', district: 'Unakoti, Tripura', score: 42, status: 'MODERATE' },
            ].map((zone, idx) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-400">{zone.district}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    zone.status === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 'bg-orange-500/20 text-orange-400'
                  }`}>
                    {zone.score}
                  </span>
                </div>
                <p className="font-bold text-white text-sm truncate">{zone.state}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/60 border border-red-500/30 rounded-2xl p-8 text-center space-y-6">
          <ShieldCheck className="w-12 h-12 text-red-400 mx-auto animate-bounce" />
          <h2 className="text-3xl font-extrabold text-white">Ready for Disaster Response Operations?</h2>
          <p className="text-slate-300 max-w-2xl mx-auto text-sm">
            Access real-time GIS layers, acknowledge emergency warnings, and execute scenario simulations on the official authority dashboard.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-lg font-bold bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-950/60 transition"
            >
              Enter Authority Control Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
