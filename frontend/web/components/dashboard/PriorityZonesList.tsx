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
  // Sort by risk score descending
  const sortedZones = [...zones].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="font-bold text-white text-base flex items-center gap-2">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Priority Response Sectors</span>
          </h2>
          <p className="text-xs text-slate-400">Ranked by AI landslide risk score</p>
        </div>
        <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
          {zones.length} Total
        </span>
      </div>

      <div className="divide-y divide-slate-800/80 overflow-y-auto max-h-[520px]">
        {sortedZones.map((zone) => {
          const isSelected = selectedZoneId === zone.zone_id;
          return (
            <div
              key={zone.zone_id}
              onClick={() => onSelectZone && onSelectZone(zone)}
              className={`p-4 transition cursor-pointer hover:bg-slate-800/60 ${
                isSelected ? 'bg-slate-800/90 border-l-4 border-amber-500' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm hover:text-amber-400 transition">
                      {zone.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">({zone.district})</span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{zone.state}</p>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded border ${getRiskBadgeClasses(zone.risk_level)}`}>
                    {zone.risk_score} — {zone.risk_level}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">Conf: {zone.confidence}%</span>
                </div>
              </div>

              {/* Environment Parameters Pill Row */}
              <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800/50 text-[11px] font-mono text-slate-300">
                <div className="flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-400" />
                  <span>{zone.rainfall_mm} mm</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-amber-400">Soil:</span>
                  <span>{zone.soil_moisture}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mountain className="w-3.5 h-3.5 text-orange-400" />
                  <span>{zone.slope_deg}°</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-[10px] text-slate-400">
                  {zone.affected_villages.length} Villages Affected
                </span>
                <Link
                  href={`/dashboard/simulator?zone_id=${zone.zone_id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-mono text-[11px] hover:underline"
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
