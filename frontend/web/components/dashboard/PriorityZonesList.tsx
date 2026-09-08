'use client';

import { RiskZone } from '@/lib/api/types';
import { getRiskBadgeClasses } from '@/lib/utils/riskUtils';
import { MapPin, ArrowUpRight, CloudRain, Mountain } from 'lucide-react';
import Link from 'next/link';

export default function PriorityZonesList({
  zones,
  onSelectZone,
  selectedZoneId,
}: {
  zones: RiskZone[];
  onSelectZone?: (zone: RiskZone) => void;
  selectedZoneId?: string;
}) {
  const sortedZones = [...zones].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="surface-card flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-slate-950 text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-700" />
            <span>Priority Response Sectors</span>
          </h2>
          <p className="text-xs text-slate-500">Ranked by AI landslide risk score</p>
        </div>
        <span className="text-xs font-mono bg-slate-50 text-slate-600 px-2 py-0.5 rounded border border-slate-100 tabular-nums">
          {zones.length} Total
        </span>
      </div>

      <div className="divide-y divide-slate-100 overflow-y-auto max-h-[520px]">
        {sortedZones.map((zone) => {
          const isSelected = selectedZoneId === zone.zone_id;
          return (
            <div
              key={zone.zone_id}
              onClick={() => onSelectZone && onSelectZone(zone)}
              className={`p-4 transition duration-200 cursor-pointer hover:bg-sky-50 ${isSelected ? 'bg-sky-50 border-l-4 border-sky-600' : ''
                }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm hover:text-sky-700 transition duration-200">
                      {zone.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">({zone.district})</span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">{zone.state}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${getRiskBadgeClasses(zone.risk_level)}`}>
                    {zone.risk_score} — {zone.risk_level}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono tabular-nums">Conf: {zone.confidence}%</span>
                </div>
              </div>

              {/* Environment Parameters Pill Row */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-100 text-[11px] font-mono text-slate-700 tabular-nums">
                <div className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-sky-600" />
                  <span>{zone.rainfall_mm} mm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-sky-700">Soil:</span>
                  <span>{zone.soil_moisture}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-sky-600" />
                  <span>{zone.slope_deg}°</span>
                </div>
              </div>

              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-[10px] text-slate-500">
                  {zone.affected_villages.length} Villages Affected
                </span>
                <Link
                  href={`/dashboard/simulator?zone_id=${zone.zone_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-sky-700 hover:text-sky-800 font-mono text-[11px] hover:underline"
                >
                  <span>Simulate</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
