import { Cloud, Cpu, MapPin, BellRing, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  const steps = [
    {
      step: '01',
      title: 'Multi-Source Environmental Ingestion',
      icon: Cloud,
      description: 'Continuous ingestion of rainfall forecasts from weather APIs, satellite soil moisture sensors, and GIS DEM elevation models across all 8 NER states.',
    },
    {
      step: '02',
      title: 'AI Slope Stability Model Execution',
      icon: Cpu,
      description: 'AI model computes physical factor of safety and slope shear stress, yielding a normalized 0-100 risk score with confidence metrics.',
    },
    {
      step: '03',
      title: 'Geospatial Mapping & Infrastructure Cross-Referencing',
      icon: MapPin,
      description: 'Risk scores are dynamically overlaid on vector maps, linking high-risk polygons to nearby habitations, roads, and vital corridors.',
    },
    {
      step: '04',
      title: 'Automated Warning Dispatch & Decision Support',
      icon: BellRing,
      description: 'Instant notification triggers for critical risk (>75), generating pre-scripted evacuation orders and traffic rerouting plans.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">How NER-SENTRY Works</h1>
        <p className="text-slate-300 text-base">
          From raw satellite rainfall feeds to authority control-room action in milliseconds.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-6 relative space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-mono text-2xl font-bold text-amber-500">{item.step}</span>
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-slate-300">
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <h3 className="font-bold text-white text-lg">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 space-y-4 text-center">
        <h2 className="text-2xl font-bold text-white">AI Engine Factor Breakdown</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <p className="text-amber-400 font-bold text-xl">35%</p>
            <p className="text-xs text-slate-400">24h Accumulated Rain</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <p className="text-amber-400 font-bold text-xl">25%</p>
            <p className="text-xs text-slate-400">Soil Moisture Saturation</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <p className="text-amber-400 font-bold text-xl">25%</p>
            <p className="text-xs text-slate-400">Slope Angle & Elevation</p>
          </div>
          <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
            <p className="text-amber-400 font-bold text-xl">15%</p>
            <p className="text-xs text-slate-400">Historical Slide Memory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
