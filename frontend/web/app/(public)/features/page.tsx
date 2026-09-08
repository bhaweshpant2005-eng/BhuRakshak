import { Map, SlidersHorizontal, AlertOctagon, BarChart3, Users, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function FeaturesPage() {
  const features = [
    {
      title: 'Interactive GIS Risk Map & Heatmap',
      icon: Map,
      description: 'Dynamic vector maps with color-coded risk zones, road blockages, and vulnerable village markers across North East India.',
    },
    {
      title: 'Hero What-If Risk Simulator',
      icon: SlidersHorizontal,
      description: 'Simulate extreme rainfall scenarios (+100% to +200%, 1h to 72h duration) to preview projected risk escalation and impacted roads.',
    },
    {
      title: 'Real-Time Alert Dispatch & Management',
      icon: AlertOctagon,
      description: 'Control-room center for acknowledging critical warnings, issuing evacuation notices, and tracking active disaster alerts.',
    },
    {
      title: 'Historical Landslide & Rainfall Analytics',
      icon: BarChart3,
      description: 'Interactive Recharts trends correlating past landslide occurrences with 24-hour rainfall thresholds and soil moisture levels.',
    },
    {
      title: 'Vulnerable Village & Highway Overlay',
      icon: Users,
      description: 'Cross-reference high-risk zones directly with census population counts and arterial lifeline roads like NH-10 and NH-2.',
    },
    {
      title: 'Citizen & Field Report Verification',
      icon: ShieldAlert,
      description: 'Ingest ground-level reports of soil cracking, rockfalls, and water seepage submitted by field agents and citizens.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <h1 className="text-balance text-3xl sm:text-4xl font-extrabold text-slate-950">Platform features</h1>
        <p className="text-pretty text-slate-600 text-base">
          A comprehensive software decision-support suite tailored for State and District Disaster Management Authorities.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div key={idx} className="surface-card-interactive p-6 space-y-4">
              <div className="size-12 rounded-lg bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-700">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-950 text-lg">{item.title}</h3>
              <p className="text-pretty text-slate-600 text-sm leading-relaxed">{item.description}</p>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-6">
        <Link
          href="/dashboard"
          className="button-primary px-6 py-3"
        >
          Explore All Features on Dashboard
        </Link>
      </div>
    </div>
  );
}
