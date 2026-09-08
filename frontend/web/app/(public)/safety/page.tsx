import { ShieldCheck, AlertTriangle, PhoneCall, CheckCircle, Flame, Compass } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>PUBLIC SAFETY & EVACUATION PROTOCOL</span>
        </div>
        <h1 className="text-balance text-3xl sm:text-4xl font-extrabold text-slate-950">Landslide safety and guidelines</h1>
        <p className="text-pretty text-slate-600 text-base">
          Crucial steps for citizens and local village headmen when living in high-risk slope zones in North East India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-sky-700 font-bold text-lg">
            <AlertTriangle className="w-6 h-6" />
            <span>Before Monsoon / Early Warnings</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Inspect slopes behind homes for fresh tension cracks or sudden water seepage.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Ensure mountain drainage gullies are clear of plastic garbage and fallen logs.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Keep an emergency Go-Bag ready with documents, torch, battery radio, and medicine.</span>
            </li>
          </ul>
        </div>

        <div className="rounded-xl border border-red-200 bg-red-50 p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-700 font-bold text-lg">
            <Flame className="w-6 h-6" />
            <span>During Active Heavy Downpours</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-700">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>If you hear rumbling noises, cracking trees, or sudden muddy water flow, evacuate immediately.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Move PERPENDICULAR to the slide path—never run downhill ahead of a debris flow.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <span>Stay clear of steep road embankments along national highways.</span>
            </li>
          </ul>
        </div>

        <div className="surface-card p-6 space-y-4">
          <div className="flex items-center gap-3 text-sky-700 font-bold text-lg">
            <Compass className="w-6 h-6" />
            <span>After a Slide Event</span>
          </div>
          <ul className="space-y-3 text-sm text-slate-600">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Stay away from the slide area. Secondary slides frequently occur hours later.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Report trapped individuals immediately to local DDMA authorities or 1078.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <span>Check for damaged electrical lines or broken water pipes before returning.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="surface-card p-6 sm:p-8 text-center space-y-4">
        <PhoneCall className="w-10 h-10 text-sky-700 mx-auto" />
        <h2 className="text-balance text-2xl font-bold text-slate-950">Emergency Disaster Response Helplines</h2>
        <div className="flex flex-wrap justify-center gap-6 text-sm font-mono pt-2">
          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <span className="text-slate-500">National Disaster Helpline:</span> <span className="text-red-700 font-bold">1078</span>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <span className="text-slate-500">State Control Room (Assam/Meghalaya):</span> <span className="text-sky-700 font-bold">1070</span>
          </div>
          <div className="bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <span className="text-slate-500">Sikkim Emergency Hotline:</span> <span className="text-sky-700 font-bold">03592-202892</span>
          </div>
        </div>
      </div>
    </div>
  );
}
