'use client';

import { useEffect, useState } from 'react';
import { HistoricalLandslide } from '@/lib/api/types';
import { getHistoricalLandslides } from '@/lib/api/services';
import RiskTrendChart from '@/components/charts/RiskTrendChart';
import RainfallSoilCorrelation from '@/components/charts/RainfallSoilCorrelation';
import VillageVulnerabilityChart from '@/components/charts/VillageVulnerabilityChart';
import { BarChart2, History, AlertTriangle } from 'lucide-react';

export default function AnalyticsPage() {
  const [history, setHistory] = useState<HistoricalLandslide[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    getHistoricalLandslides().then((data) => {
      setHistory(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400 font-mono text-xs">
        Loading Historical Analytics Engine...
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-purple-400" />
            <span>Historical Landslide & Risk Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Correlating past disaster events with 24-hour rainfall intensity, soil saturation thresholds, and casualty data
          </p>
        </div>
      </div>

      {/* Recharts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskTrendChart />
        <RainfallSoilCorrelation />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <VillageVulnerabilityChart />
        </div>

        {/* Historical Landslides Log Table */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-amber-400" />
              <h2 className="font-bold text-white text-base">Historical Slide Memory Log</h2>
            </div>
            <span className="text-xs font-mono bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded border border-slate-700">
              {history.length} Major Recorded Events
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="pb-2">Date</th>
                  <th className="pb-2">Location</th>
                  <th className="pb-2">State</th>
                  <th className="pb-2">Rain (mm)</th>
                  <th className="pb-2">Risk Score</th>
                  <th className="pb-2">Casualties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/50">
                    <td className="py-2.5 text-slate-300 font-semibold">{h.date}</td>
                    <td className="py-2.5 text-white font-bold">{h.location}</td>
                    <td className="py-2.5 text-amber-400">{h.state}</td>
                    <td className="py-2.5 text-blue-400 font-bold">{h.rainfall_recorded_mm} mm</td>
                    <td className="py-2.5 text-red-400 font-bold">{h.risk_score_at_event}</td>
                    <td className="py-2.5 text-slate-200">
                      {h.casualties > 0 ? (
                        <span className="text-red-400 font-bold">{h.casualties} Deaths</span>
                      ) : (
                        <span className="text-slate-500">0</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
