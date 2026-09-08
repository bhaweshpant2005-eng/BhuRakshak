import { ShieldCheck, AlertTriangle, PhoneCall, CheckCircle, Flame, Compass } from 'lucide-react';

export default function SafetyPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>PUBLIC SAFETY & EVACUATION PROTOCOL</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">Landslide Safety & Guidelines</h1>
        <p className="text-slate-300 text-base">
          Crucial steps for citizens and local village headmen when living in high-risk slope zones in North East India.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-amber-400 font-bold text-lg">
            <AlertTriangle className="w-6 h-6" />
            <span>Before Monsoon / Early Warnings</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Inspect slopes behind homes for fresh tension cracks or sudden water seepage.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Ensure mountain drainage gullies are clear of plastic garbage and fallen logs.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Keep an emergency Go-Bag ready with documents, torch, battery radio, and medicine.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-red-500/40 rounded-xl p-6 space-y-4 bg-red-950/10">
          <div className="flex items-center gap-3 text-red-400 font-bold text-lg">
            <Flame className="w-6 h-6" />
            <span>During Active Heavy Downpours</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>If you hear rumbling noises, cracking trees, or sudden muddy water flow, evacuate immediately.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>Move PERPENDICULAR to the slide path—never run downhill ahead of a debris flow.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>Stay clear of steep road embankments along national highways.</span>
            </li>
          </ul>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-blue-400 font-bold text-lg">
            <Compass className="w-6 h-6" />
            <span>After a Slide Event</span>
          </div>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Stay away from the slide area. Secondary slides frequently occur hours later.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Report trapped individuals immediately to local DDMA authorities or 1078.</span>
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>Check for damaged electrical lines or broken water pipes before returning.</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center space-y-4">
        <PhoneCall className="w-10 h-10 text-amber-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Emergency Disaster Response Helplines</h2>
        <div className="flex flex-wrap justify-center gap-6 text-sm font-mono pt-2">
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            <span className="text-slate-400">National Disaster Helpline:</span> <span className="text-red-400 font-bold">1078</span>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            <span className="text-slate-400">State Control Room (Assam/Meghalaya):</span> <span className="text-amber-400 font-bold">1070</span>
          </div>
          <div className="bg-slate-950 px-4 py-2 rounded-lg border border-slate-800">
            <span className="text-slate-400">Sikkim Emergency Hotline:</span> <span className="text-emerald-400 font-bold">03592-202892</span>
          </div>
        </div>
      </div>
    </div>
  );
}
