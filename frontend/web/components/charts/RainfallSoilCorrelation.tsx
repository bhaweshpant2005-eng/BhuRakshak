'use client';

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function RainfallSoilCorrelation() {
  const data = [
    { zone: 'Sohra', rainfall: 312, soilMoisture: 91 },
    { zone: 'Gangtok', rainfall: 245, soilMoisture: 87 },
    { zone: 'Kohima', rainfall: 198, soilMoisture: 84 },
    { zone: 'Guwahati', rainfall: 165, soilMoisture: 82 },
    { zone: 'Senapati', rainfall: 154, soilMoisture: 78 },
    { zone: 'Tawang', rainfall: 178, soilMoisture: 80 },
    { zone: 'Lunglei', rainfall: 142, soilMoisture: 75 },
    { zone: 'Unakoti', rainfall: 98, soilMoisture: 61 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm">24h Rainfall vs Soil Moisture Saturation</h3>
          <p className="text-xs text-slate-400">Environmental triggers across monitored sectors</p>
        </div>
        <span className="text-[10px] font-mono bg-slate-800 text-blue-400 px-2 py-0.5 rounded border border-slate-700">
          Geo Ingestion
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="zone" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis yAxisId="left" stroke="#38bdf8" tick={{ fontSize: 11 }} label={{ value: 'Rainfall (mm)', angle: -90, position: 'insideLeft', fill: '#38bdf8', fontSize: 10 }} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 100]} stroke="#f59e0b" tick={{ fontSize: 11 }} label={{ value: 'Soil Moisture (%)', angle: 90, position: 'insideRight', fill: '#f59e0b', fontSize: 10 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Bar yAxisId="left" dataKey="rainfall" name="Rainfall (mm)" fill="#38bdf8" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="soilMoisture" name="Soil Moisture (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
