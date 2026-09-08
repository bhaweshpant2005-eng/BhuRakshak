'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { RiskZone } from '@/lib/api/types';
import { getZoneById } from '@/lib/api/services';
import { getRiskBadgeClasses } from '@/lib/utils/riskUtils';
import MapContainer from '@/components/gis/MapContainer';
import Link from 'next/link';
import { MapPin, CloudRain, Mountain, ShieldAlert, ArrowLeft, SlidersHorizontal, Home, Navigation, AlertTriangle } from 'lucide-react';

export default function ZoneDetailsPage() {
  const params = useParams();
  const zoneId = params?.id as string;

  const [zone, setZone] = useState<RiskZone | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (zoneId) {
      getZoneById(zoneId).then((data) => {
        setZone(data);
        setLoading(false);
      });
    }
  }, [zoneId]);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-500 font-mono text-xs">
        Loading Zone Sector Profile...
      </div>
    );
  }

  if (!zone) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-400">Zone profile not found.</p>
        <Link href="/dashboard/zones" className="text-xs text-amber-400 hover:underline">
          Return to Zones List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <Link
          href="/dashboard/zones"
          className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-950 transition font-mono"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Sectors</span>
        </Link>

        <Link
          href={`/dashboard/simulator?zone_id=${zone.zone_id}`}
          className="button-primary px-4 py-2 text-xs"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Simulate What-If Rain Scenario</span>
        </Link>
      </div>

      {/* Header Info Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded border border-slate-200">
              ID: {zone.zone_id}
            </span>
            <span className={`text-xs font-bold font-mono px-3 py-1 rounded border ${getRiskBadgeClasses(zone.risk_level)}`}>
              {zone.risk_level} LEVEL
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950">{zone.name}</h1>
          <p className="text-sm text-slate-500 font-mono">
            District: <strong className="text-slate-950">{zone.district}</strong> | State: <strong className="text-amber-400">{zone.state}</strong>
          </p>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-center font-mono space-y-1 min-w-[200px]">
          <span className="text-xs text-slate-500 uppercase">Explainable Risk Score</span>
          <div className="text-4xl font-extrabold text-red-400">{zone.risk_score} <span className="text-sm font-normal text-slate-500">/100</span></div>
          <span className="text-[11px] text-emerald-400">Confidence: {zone.confidence}%</span>
        </div>
      </div>

      {/* Environmental Parameters Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-blue-400">
            <span className="text-xs font-mono uppercase">24h Rainfall</span>
            <CloudRain className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-slate-950 font-mono">{zone.rainfall_mm} mm</p>
          <p className="text-[11px] text-slate-500">Accumulated precipitation</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-amber-400">
            <span className="text-xs font-mono uppercase">Soil Moisture</span>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-slate-950 font-mono">{zone.soil_moisture}%</p>
          <p className="text-[11px] text-slate-500">Layer saturation level</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-orange-400">
            <span className="text-xs font-mono uppercase">Slope Angle</span>
            <Mountain className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-slate-950 font-mono">{zone.slope_deg}°</p>
          <p className="text-[11px] text-slate-500">Escarpment gradient</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-1">
          <div className="flex items-center justify-between text-purple-400">
            <span className="text-xs font-mono uppercase">Elevation</span>
            <MapPin className="w-4 h-4" />
          </div>
          <p className="text-2xl font-extrabold text-slate-950 font-mono">{zone.elevation_m} m</p>
          <p className="text-[11px] text-slate-500">Height above sea level</p>
        </div>
      </div>

      {/* Main Grid: GIS Map + Risk Factors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MapContainer zones={[zone]} selectedZoneId={zone.zone_id} />
        </div>

        <div className="space-y-6">
          {/* Risk Factors */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="font-bold text-slate-950 text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Key Trigger Factors</span>
            </h3>
            <ul className="space-y-2 text-xs">
              {zone.risk_factors.map((factor, idx) => (
                <li key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-200 text-slate-700 flex items-start gap-2">
                  <span className="text-red-400 font-bold">•</span>
                  <span>{factor}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Affected Settlements & Roads */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
            <div>
              <h4 className="font-bold text-slate-950 text-xs uppercase flex items-center gap-2 text-blue-400 mb-2">
                <Home className="w-4 h-4" />
                <span>Affected Settlements ({zone.affected_villages.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {zone.affected_villages.map((v, i) => (
                  <span key={i} className="text-xs font-mono bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                    {v}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-bold text-slate-950 text-xs uppercase flex items-center gap-2 text-purple-400 mb-2">
                <Navigation className="w-4 h-4" />
                <span>Affected Roads ({zone.affected_roads.length})</span>
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {zone.affected_roads.map((r, i) => (
                  <span key={i} className="text-xs font-mono bg-slate-50 text-slate-700 px-2.5 py-1 rounded border border-slate-200">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
