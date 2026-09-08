'use client';

import { useState, useEffect } from 'react';
import { RiskZone, Village, RoadSegment } from '@/lib/api/types';
import { getRiskZones, getVillages, getRoads } from '@/lib/api/services';
import MapContainer from '@/components/gis/MapContainer';
import PriorityZonesList from '@/components/dashboard/PriorityZonesList';
import Link from 'next/link';
import { MapPin, Filter, ArrowUpRight } from 'lucide-react';

export default function ZonesPage() {
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [roads, setRoads] = useState<RoadSegment[]>([]);
  const [filterState, setFilterState] = useState<string>('ALL');
  const [filterLevel, setFilterLevel] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<RiskZone | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [zData, vData, rData] = await Promise.all([getRiskZones(), getVillages(), getRoads()]);
        setZones(zData);
        setVillages(vData);
        setRoads(rData);
        if (zData.length > 0) setSelectedZone(zData[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredZones = zones.filter((z) => {
    if (filterState !== 'ALL' && z.state !== filterState) return false;
    if (filterLevel !== 'ALL' && z.risk_level !== filterLevel) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading GIS Zones Feed...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-amber-500" />
            <span>Monitored Landslide Risk Zones</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Filterable GIS coverage across North Eastern Region states and high-risk districts
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <Filter className="w-4 h-4 text-amber-400" />
            <span>State:</span>
          </div>
          <select
            value={filterState}
            onChange={(e) => setFilterState(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 font-medium"
          >
            <option value="ALL">All States (NER)</option>
            <option value="Meghalaya">Meghalaya</option>
            <option value="Sikkim">Sikkim</option>
            <option value="Nagaland">Nagaland</option>
            <option value="Assam">Assam</option>
            <option value="Manipur">Manipur</option>
            <option value="Mizoram">Mizoram</option>
            <option value="Arunachal Pradesh">Arunachal Pradesh</option>
            <option value="Tripura">Tripura</option>
          </select>

          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg p-2 font-medium"
          >
            <option value="ALL">All Severity Levels</option>
            <option value="CRITICAL">CRITICAL (&gt;75)</option>
            <option value="HIGH">HIGH (51–75)</option>
            <option value="MODERATE">MODERATE (26–50)</option>
            <option value="LOW">LOW (0–25)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <MapContainer
            zones={filteredZones}
            villages={villages}
            roads={roads}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={(z) => setSelectedZone(z)}
          />

          {selectedZone && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Active Sector Card</span>
                  <h3 className="font-bold text-white text-lg">{selectedZone.name}</h3>
                </div>
                <span className="text-sm font-mono font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded border border-red-500/30">
                  Risk Score: {selectedZone.risk_score}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Rainfall (24h)</span>
                  <span className="font-bold text-blue-400">{selectedZone.rainfall_mm} mm</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Soil Moisture</span>
                  <span className="font-bold text-amber-400">{selectedZone.soil_moisture}%</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Slope Angle</span>
                  <span className="font-bold text-orange-400">{selectedZone.slope_deg}°</span>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Elevation</span>
                  <span className="font-bold text-slate-200">{selectedZone.elevation_m} m</span>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Link
                  href={`/dashboard/simulator?zone_id=${selectedZone.zone_id}`}
                  className="flex items-center gap-1 px-4 py-2 rounded text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition"
                >
                  <span>Simulate Rain Scenario</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href={`/dashboard/zones/${selectedZone.zone_id}`}
                  className="px-4 py-2 rounded text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  View Full Profile
                </Link>
              </div>
            </div>
          )}
        </div>

        <div>
          <PriorityZonesList
            zones={filteredZones}
            selectedZoneId={selectedZone?.zone_id}
            onSelectZone={(z) => setSelectedZone(z)}
          />
        </div>
      </div>
    </div>
  );
}
