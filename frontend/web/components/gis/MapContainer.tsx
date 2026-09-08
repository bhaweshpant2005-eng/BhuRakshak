'use client';

import dynamic from 'next/dynamic';
import { RiskZone, Village, RoadSegment } from '@/lib/api/types';
import { MapPin } from 'lucide-react';

const RiskMap = dynamic(() => import('./RiskMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] bg-sky-50 border border-sky-100 rounded-xl flex flex-col items-center justify-center space-y-3 text-slate-500">
      <div className="w-8 h-8 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-xs font-mono">Loading GIS Geospatial Engine...</p>
    </div>
  ),
});

export default function MapContainer({
  zones,
  villages,
  roads,
  selectedZoneId,
  onSelectZone,
}: {
  zones: RiskZone[];
  villages?: Village[];
  roads?: RoadSegment[];
  selectedZoneId?: string;
  onSelectZone?: (zone: RiskZone) => void;
}) {
  return (
    <div className="w-full h-[500px] relative rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      <RiskMap
        zones={zones}
        villages={villages}
        roads={roads}
        selectedZoneId={selectedZoneId}
        onSelectZone={onSelectZone}
      />
    </div>
  );
}
