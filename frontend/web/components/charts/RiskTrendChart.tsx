'use client';

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

export default function RiskTrendChart() {
  const data = [
    { time: '00:00', Sohra: 64, Gangtok: 58, Kohima: 52, Guwahati: 42 },
    { time: '04:00', Sohra: 68, Gangtok: 62, Kohima: 56, Guwahati: 45 },
    { time: '08:00', Sohra: 76, Gangtok: 70, Kohima: 64, Guwahati: 52 },
    { time: '12:00', Sohra: 82, Gangtok: 76, Kohima: 72, Guwahati: 65 },
    { time: '16:00', Sohra: 88, Gangtok: 82, Kohima: 79, Guwahati: 76 },
    { time: '20:00', Sohra: 85, Gangtok: 80, Kohima: 76, Guwahati: 72 },
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-bold text-white text-sm">24-Hour AI Risk Score Progression</h3>
          <p className="text-xs text-slate-400">Tracking score escalation across critical NER sectors</p>
        </div>
        <span className="text-[10px] font-mono bg-slate-800 text-amber-400 px-2 py-0.5 rounded border border-slate-700">
          Live Trend
        </span>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
            <YAxis domain={[0, 100]} stroke="#64748b" tick={{ fontSize: 11 }} />
            <Tooltip
              contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '12px' }}
              labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
            />
            <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
            <Line type="monotone" dataKey="Sohra" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} />
            <Line type="monotone" dataKey="Gangtok" stroke="#f97316" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Kohima" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Guwahati" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
