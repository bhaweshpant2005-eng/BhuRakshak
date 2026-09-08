import { Mountain, CloudRain, ShieldAlert, Layers } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">The North Eastern Region (NER) Challenge</h1>
        <p className="text-slate-300 text-base leading-relaxed">
          The North Eastern Region of India—spanning 8 states—faces unique geo-hydrological vulnerabilities during the annual monsoon season. High relief terrain, young geological formations, intense localized downpours, and uncoordinated slope cuts frequently trigger catastrophic landslides.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-amber-400 font-bold text-lg">
            <CloudRain className="w-6 h-6" />
            <span>Extreme Precipitation Patterns</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Sohra (Cherrapunjee) and surrounding belts receive over 11,000 mm of annual rainfall. Short-duration high-intensity rainfall spikes quickly supersaturate upper soil layers, exceeding shear strength thresholds and causing slope shear failure within hours.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-400 font-bold text-lg">
            <Mountain className="w-6 h-6" />
            <span>Fragile Geology & Steep Slopes</span>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            The Eastern Himalayas and Indo-Burma ranges consist of heavily weathered sandstone, shale, and clay deposits with slope angles exceeding 35° to 45°. Seismic activity in Zone V further degrades slope cohesion over time.
          </p>
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-8 space-y-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <ShieldAlert className="w-6 h-6 text-red-500" />
          <span>NER-SENTRY Solution Architecture</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-sm">
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Software-Only Core</h3>
            <p className="text-slate-400">Zero reliance on expensive hardware, ESP32s, or LoRa networks. Uses public APIs, satellite feeds, and curated datasets.</p>
          </div>
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Predictive Risk Scoring</h3>
            <p className="text-slate-400">Combines slope steepness, soil saturation, elevation, and live rainfall into standardized 0–100 risk indexes.</p>
          </div>
          <div className="bg-slate-950 p-5 rounded-lg border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Actionable Warnings</h3>
            <p className="text-slate-400">Provides authorities with exact affected village names, vulnerable highway corridors, and response steps.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
