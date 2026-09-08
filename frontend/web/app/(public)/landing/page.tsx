import Link from 'next/link';
import { ShieldAlert, CloudRain, Cpu, Activity, ArrowRight, ShieldCheck, Navigation, SlidersHorizontal } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-sky-100 bg-sky-50 pt-16 pb-20 sm:pt-20 sm:pb-24">
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-sky-100"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center space-y-7 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-sky-200 text-sky-700 text-[10px] sm:text-xs font-mono font-bold tracking-wider shadow-sm uppercase">
              <ShieldAlert className="w-4 h-4" />
              <span>DISASTER MANAGEMENT & DECISION SUPPORT SYSTEM</span>
            </div>

            <h1 className="font-display text-balance text-4xl sm:text-6xl font-extrabold text-slate-950 leading-[1.08]">
              Early warning and risk prediction for <span className="text-sky-700">North East India</span>
            </h1>

            <p className="text-pretty text-lg text-slate-600 max-w-3xl mx-auto leading-8">
              Transforming complex monsoon rainfall forecasts, soil moisture saturation models, steep terrain GIS topology, and historical landslide data into actionable early warnings for Disaster Management Authorities.
            </p>

            <div className="flex flex-wrap justify-center items-center gap-3 pt-3">
              <Link
                href="/dashboard"
                className="button-primary px-6 py-3.5 text-base"
              >
                <Activity className="w-5 h-5" />
                <span>Launch Authority Control Room</span>
              </Link>

              <Link
                href="/dashboard/simulator"
                className="button-secondary px-6 py-3.5 text-base"
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
          <h2 className="text-balance text-2xl sm:text-3xl font-bold text-slate-950">NER disaster mitigation capabilities</h2>
          <p className="text-slate-500 text-sm mt-3">Built for the eight North Eastern states facing monsoon slope instability.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="surface-card-interactive p-6 space-y-4">
            <div className="size-12 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
              <CloudRain className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-950">Continuous Geo-API Ingestion</h3>
            <p className="text-pretty text-slate-600 text-sm leading-relaxed">
              Consolidates 24-hour accumulated rainfall forecasts, soil moisture satellite feeds, and elevation terrain maps across Assam, Sikkim, Meghalaya, Nagaland, Manipur, Mizoram, Tripura, and Arunachal Pradesh.
            </p>
          </div>

          <div className="surface-card-interactive p-6 space-y-4">
            <div className="size-12 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-950">AI Slope Physics Risk Scoring</h3>
            <p className="text-pretty text-slate-600 text-sm leading-relaxed">
              Machine learning models calculate precise 0-100 risk scores and classify zones into LOW (0-25), MODERATE (26-50), HIGH (51-75), and CRITICAL (76-100) risk levels with confidence ratings.
            </p>
          </div>

          <div className="surface-card-interactive p-6 space-y-4">
            <div className="size-12 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-950">What-If Scenario Simulator</h3>
            <p className="text-pretty text-slate-600 text-sm leading-relaxed">
              Enables disaster commanders to simulate heavy rainfall scenarios (e.g. +150% rainfall for 48 hours), projecting affected villages, highway closures, and recommended evacuation timelines before landslides occur.
            </p>
          </div>
        </div>
      </section>

      {/* Target States Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="surface-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-balance text-2xl font-bold text-slate-950">Monitored North Eastern Region Sectors</h3>
              <p className="text-slate-500 text-sm mt-1">Covering key arterial corridors and vulnerable settlements</p>
            </div>
            <Link
              href="/dashboard/zones"
              className="inline-flex items-center gap-2 text-sm font-semibold text-sky-700 hover:text-sky-800 transition duration-200"
            >
              <span>Explore All 32 GIS Zones</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
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
              <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-4 space-y-2 transition duration-200 hover:-translate-y-0.5 hover:bg-sky-50">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">{zone.district}</span>
                  <span className={`px-1.5 py-0.5 rounded font-bold ${
                    zone.status === 'CRITICAL' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {zone.score}
                  </span>
                </div>
                <p className="font-bold text-slate-900 text-sm truncate">{zone.state}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Box */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-sky-100 bg-sky-50 p-8 text-center space-y-5">
          <ShieldCheck className="w-12 h-12 text-sky-700 mx-auto" />
          <h2 className="text-balance text-3xl font-extrabold text-slate-950">Ready for disaster response operations?</h2>
          <p className="text-pretty text-slate-600 max-w-2xl mx-auto text-sm leading-relaxed">
            Access real-time GIS layers, acknowledge emergency warnings, and execute scenario simulations on the official authority dashboard.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/dashboard"
              className="button-primary px-6 py-3"
            >
              Enter Authority Control Center
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
