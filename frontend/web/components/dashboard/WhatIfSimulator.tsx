'use client';

import { useState } from 'react';
import { RiskZone, SimulationResponse } from '@/lib/api/types';
import { runSimulation } from '@/lib/api/services';
import { getRiskBadgeClasses, getRiskColor } from '@/lib/utils/riskUtils';
import {
  SlidersHorizontal,
  CloudRain,
  Clock,
  Play,
  TrendingUp,
  AlertTriangle,
  Home,
  Navigation,
  ShieldCheck,
  CheckSquare,
  Sparkles,
} from 'lucide-react';

export default function WhatIfSimulator({
  zones,
  initialZoneId,
}: {
  zones: RiskZone[];
  initialZoneId?: string;
}) {
  const [selectedZoneId, setSelectedZoneId] = useState<string>(
    initialZoneId || zones[0]?.zone_id || 'Z-NER-001'
  );
  const [rainfallChange, setRainfallChange] = useState<number>(50); // +50% default
  const [durationHours, setDurationHours] = useState<number>(24); // 24h default
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<SimulationResponse | null>(null);

  const selectedZone = zones.find((z) => z.zone_id === selectedZoneId) || zones[0];

  const handleRunSimulation = async () => {
    setLoading(true);
    try {
      const res = await runSimulation({
        zone_id: selectedZoneId,
        rainfall_change_percent: rainfallChange,
        duration_hours: durationHours,
      });
      setResult(res);
    } catch (err) {
      console.error('Simulation error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HERO FEATURE — DECISION SUPPORT ENGINE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <SlidersHorizontal className="w-6 h-6 text-amber-400" />
            <span>What-If Landslide Scenario Simulator</span>
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            Simulate climate extremes, cloudbursts, and prolonged monsoon spells to project risk escalation before disaster strikes.
          </p>
        </div>

        {/* Zone Selector */}
        <div className="min-w-[240px]">
          <label className="block text-xs font-mono text-slate-400 mb-1 font-semibold">Select Target Sector:</label>
          <select
            value={selectedZoneId}
            onChange={(e) => {
              setSelectedZoneId(e.target.value);
              setResult(null);
            }}
            className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-sm rounded-lg p-2.5 font-medium focus:ring-2 focus:ring-amber-500 focus:outline-none"
          >
            {zones.map((z) => (
              <option key={z.zone_id} value={z.zone_id}>
                {z.name} ({z.state}) — Score {z.risk_score}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950 p-5 rounded-xl border border-slate-800">
        {/* Rainfall Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-blue-400" />
              <span>Rainfall Variance (%):</span>
            </label>
            <span className="font-mono text-base font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/30">
              {rainfallChange > 0 ? `+${rainfallChange}%` : `${rainfallChange}%`}
            </span>
          </div>
          <input
            type="range"
            min="-50"
            max="200"
            step="10"
            value={rainfallChange}
            onChange={(e) => setRainfallChange(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>-50% (Drought)</span>
            <span>0% (Baseline)</span>
            <span>+100% (Cloudburst)</span>
            <span>+200% (Extreme Monsoon)</span>
          </div>
        </div>

        {/* Duration Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              <span>Precipitation Duration (Hours):</span>
            </label>
            <span className="font-mono text-base font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded border border-purple-500/30">
              {durationHours} Hours
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="72"
            step="1"
            value={durationHours}
            onChange={(e) => setDurationHours(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />
          <div className="flex justify-between text-[11px] text-slate-500 font-mono">
            <span>1 Hour (Flash Surge)</span>
            <span>24 Hours</span>
            <span>48 Hours</span>
            <span>72 Hours (3-Day Downpour)</span>
          </div>
        </div>

        {/* Run Simulation CTA */}
        <div className="md:col-span-2 flex justify-end pt-2">
          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3.5 rounded-lg text-base font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xl shadow-amber-950/40 transition transform active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                <span>Executing AI Predictive Physics Model...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-slate-950" />
                <span>Run Scenario Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Simulation Result Output */}
      {result && (
        <div className="space-y-6 pt-4 border-t border-slate-800 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-400" />
              <span>Projected Impact Assessment</span>
            </h3>
            <span className="text-xs font-mono text-slate-400">
              Simulated Zone: <strong className="text-white">{selectedZone?.name}</strong>
            </span>
          </div>

          {/* Risk Score Comparison Gauges */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Baseline Gauge */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 space-y-3 text-center">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider font-semibold">
                Current Risk
              </span>
              <div className="text-4xl font-extrabold text-slate-200 font-mono">
                {result.current_risk}
                <span className="text-sm font-normal text-slate-500"> /100</span>
              </div>
              <div className="inline-block">
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded border ${getRiskBadgeClasses(result.current_level)}`}>
                  {result.current_level}
                </span>
              </div>
            </div>

            {/* Shift Indicator */}
            <div className="bg-slate-950 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-2 text-center">
              <span className="text-xs font-mono text-slate-400 uppercase">Risk Escalation Delta</span>
              <div className={`text-3xl font-extrabold font-mono ${result.delta_score >= 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                {result.delta_score >= 0 ? `+${result.delta_score}` : result.delta_score} Points
              </div>
              <p className="text-xs text-slate-400">
                Priority: <strong className="text-amber-400 font-mono">{result.recommended_priority}</strong>
              </p>
            </div>

            {/* Projected Gauge */}
            <div className="bg-gradient-to-b from-red-950/40 to-slate-950 p-5 rounded-xl border border-red-500/50 space-y-3 text-center shadow-lg shadow-red-950/30">
              <span className="text-xs font-mono text-red-400 uppercase tracking-wider font-semibold">
                Projected Risk
              </span>
              <div className="text-5xl font-extrabold text-white font-mono">
                {result.projected_risk}
                <span className="text-sm font-normal text-slate-400"> /100</span>
              </div>
              <div className="inline-block">
                <span className={`text-xs font-mono font-bold px-3 py-1 rounded border ${getRiskBadgeClasses(result.projected_level)}`}>
                  NEW CATEGORY: {result.projected_level}
                </span>
              </div>
            </div>
          </div>

          {/* Impacted Infrastructure & Villages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Impacted Villages */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Home className="w-4 h-4 text-blue-400" />
                <span>Projected Impacted Settlements</span>
              </h4>
              <ul className="space-y-2">
                {result.affected_villages.map((v, i) => (
                  <li key={i} className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-200">
                    <span className="font-medium">{v}</span>
                    <span className="text-red-400 font-mono font-semibold">High Exposure</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Impacted Roads */}
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Navigation className="w-4 h-4 text-purple-400" />
                <span>Projected Blocked Highway Corridors</span>
              </h4>
              <ul className="space-y-2">
                {result.affected_roads.map((r, i) => (
                  <li key={i} className="flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded border border-slate-800 text-slate-200">
                    <span className="font-medium">{r}</span>
                    <span className="text-amber-400 font-mono font-semibold">Disruption Likely</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Authority Priority Actions */}
          <div className="bg-slate-950 p-5 rounded-xl border border-amber-500/30 space-y-3">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-amber-400" />
              <span>Recommended Authority Protocol Checklist</span>
            </h4>
            <div className="space-y-2">
              {result.priority_actions.map((act, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-slate-200 bg-slate-900 p-3 rounded border border-slate-800">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>{act}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
