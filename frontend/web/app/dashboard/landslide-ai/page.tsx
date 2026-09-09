'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  Cpu,
  Layers,
  Sliders,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  Maximize2,
  Compass,
  Download,
  Eye,
  RefreshCw,
  ShieldAlert,
  ArrowRight,
  Mountain,
  Droplets,
  CloudRain,
  Navigation,
  FileSpreadsheet,
  CheckSquare,
} from 'lucide-react';
import { getLandslideAiDetection } from '@/lib/api/services';
import { LandslideDetectionResult, LandslideDetectionHotspot } from '@/lib/api/types';
import { BENCHMARK_SECTORS } from '@/lib/api/landslideDetectionEngine';
import { getRiskBadgeClasses } from '@/lib/utils/riskUtils';

type SpectralBandMode = 'rgb' | 'cir' | 'swir' | 'dem' | 'slope';
type ViewMode = 'overlay' | 'heatmap' | 'mask' | 'split';

export default function LandslideAiPage() {
  const [selectedSector, setSelectedSector] = useState<string>('sohra');
  const [threshold, setThreshold] = useState<number>(0.5);
  const [opacity, setOpacity] = useState<number>(75);
  const [bandMode, setBandMode] = useState<SpectralBandMode>('rgb');
  const [viewMode, setViewMode] = useState<ViewMode>('overlay');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<LandslideDetectionResult | null>(null);
  const [activeHotspot, setActiveHotspot] = useState<LandslideDetectionHotspot | null>(null);
  const [copiedCoords, setCopiedCoords] = useState<string | null>(null);

  // Fetch AI detection results
  const fetchDetection = async (sectorKey: string, thresh: number) => {
    setLoading(true);
    try {
      const data = await getLandslideAiDetection(sectorKey, thresh);
      setResult(data);
      if (data.hotspots.length > 0) {
        setActiveHotspot(data.hotspots[0]);
      }
    } catch (err) {
      console.error('Error fetching Landslide AI detection:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetection(selectedSector, threshold);
  }, [selectedSector]);

  const handleThresholdCommit = () => {
    fetchDetection(selectedSector, threshold);
  };

  const handleCopyCoords = (coords: { lat: number; lng: number }) => {
    const text = `${coords.lat}, ${coords.lng}`;
    navigator.clipboard.writeText(text);
    setCopiedCoords(text);
    setTimeout(() => setCopiedCoords(null), 2500);
  };

  // Terrain canvas texture simulation
  const sectorData = BENCHMARK_SECTORS[selectedSector] || BENCHMARK_SECTORS.sohra;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 text-xs font-mono font-bold mb-2">
            <Cpu className="w-3.5 h-3.5 text-emerald-600" />
            <span>DEEP LEARNING INFERENCE ENGINE • LANDSLIDE4SENSE</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
            <span>Landslide AI Detection (U-Net 14-Band)</span>
          </h1>
          <p className="text-slate-600 text-sm mt-1 max-w-3xl">
            Semantic segmentation of active and imminent slope failures using a 14-channel multispectral U-Net (ResNet-34 encoder) trained on Landslide4Sense Sentinel-2 satellite imagery and digital elevation models.
          </p>
        </div>

        {/* Checkpoint Status Card */}
        <div className="bg-slate-900 text-white p-4 rounded-xl shadow-sm border border-slate-800 flex items-center gap-4 min-w-[320px]">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="space-y-0.5 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-emerald-400">landslide_unet_best.pth</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-[10px] text-emerald-300 font-mono">280 MB</span>
            </div>
            <p className="text-slate-400">Architecture: U-Net (ResNet-34) • Epoch 14</p>
            <div className="flex items-center gap-3 text-[11px] font-mono text-slate-300">
              <span>Val IoU: <strong className="text-white">0.5900</strong></span>
              <span>Val Dice: <strong className="text-white">0.7422</strong></span>
              <span>Input: <strong className="text-white">14×128×128</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Strip & Sector Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Target Sector */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-sky-600" />
            <span>Target Benchmark Sector</span>
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full bg-slate-50 border border-slate-300 text-slate-900 rounded-lg p-2.5 text-sm font-semibold focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="sohra">Meghalaya — Sohra Escarpment Sector 4 (Debris Flow)</option>
            <option value="gangtok">Sikkim — Gangtok Ridge South (NH-10 Subsidence)</option>
            <option value="almora">Uttarakhand — Almora / Ranikhet Ridge Corridor</option>
            <option value="kamakhya">Assam — Nilachal Hill Kamakhya Slopes (Toe Cut)</option>
          </select>
        </div>

        {/* Spectral Band Mode */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <label className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-600" />
            <span>Multispectral Channel View</span>
          </label>
          <div className="grid grid-cols-5 gap-1">
            {[
              { id: 'rgb', label: 'RGB', desc: 'Natural' },
              { id: 'cir', label: 'CIR', desc: 'NIR Veg' },
              { id: 'swir', label: 'SWIR', desc: 'Moist' },
              { id: 'dem', label: 'DEM', desc: 'Height' },
              { id: 'slope', label: 'Slope', desc: 'Incline' },
            ].map((band) => (
              <button
                key={band.id}
                onClick={() => setBandMode(band.id as SpectralBandMode)}
                className={`py-2 px-1 text-center rounded text-xs font-mono transition ${
                  bandMode === band.id
                    ? 'bg-indigo-600 text-white font-bold shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
                title={band.desc}
              >
                {band.label}
              </button>
            ))}
          </div>
        </div>

        {/* Probability Threshold Slider */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              <span>Sensitivity Threshold:</span>
            </span>
            <span className="font-bold text-slate-900">{Math.round(threshold * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.10"
            max="0.90"
            step="0.05"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            onMouseUp={handleThresholdCommit}
            onTouchEnd={handleThresholdCommit}
            className="w-full accent-amber-500 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-slate-600">
            <span>High Recall (10%)</span>
            <span>Balanced (50%)</span>
            <span>High Precision (90%)</span>
          </div>
        </div>

        {/* Overlay Opacity & View Mode */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-xs font-mono font-semibold text-slate-600">
            <span className="flex items-center gap-1">
              <Eye className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI Mask Opacity:</span>
            </span>
            <span className="font-bold text-slate-900">{opacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            step="5"
            value={opacity}
            onChange={(e) => setOpacity(parseInt(e.target.value))}
            className="w-full accent-emerald-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
          />
          <div className="flex items-center justify-between gap-1 pt-0.5">
            {(['overlay', 'heatmap', 'mask', 'split'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`text-[10px] font-mono px-2 py-1 rounded capitalize transition ${
                  viewMode === mode
                    ? 'bg-slate-900 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {mode}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Analysis Display Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Visualizer Canvas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm space-y-4">
            {/* Visualizer Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Mountain className="w-4 h-4 text-slate-700" />
                  <span>{sectorData.name}</span>
                </span>
                <span className="text-slate-600">({sectorData.lat.toFixed(3)}°N, {sectorData.lng.toFixed(3)}°E)</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchDetection(selectedSector, threshold)}
                  disabled={loading}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-mono text-xs transition"
                >
                  <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                  <span>Re-Infer</span>
                </button>
              </div>
            </div>

            {/* Simulated Satellite & Model Mask Viewport (128x128 grid scaled up to 512x512) */}
            <div className="relative aspect-square w-full max-w-[560px] mx-auto rounded-xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-inner group">
              {/* Background Spectral Layer */}
              <div
                className="absolute inset-0 transition-all duration-300"
                style={{
                  background:
                    bandMode === 'rgb'
                      ? 'radial-gradient(ellipse at 40% 50%, #2d5a27 0%, #1e3f20 45%, #152b17 100%)'
                      : bandMode === 'cir'
                      ? 'radial-gradient(ellipse at 40% 50%, #9e2a2b 0%, #540b0e 45%, #220901 100%)'
                      : bandMode === 'swir'
                      ? 'radial-gradient(ellipse at 40% 50%, #1d3557 0%, #457b9d 45%, #0d1b2a 100%)'
                      : bandMode === 'dem'
                      ? 'linear-gradient(135deg, #f8f9fa 0%, #adb5bd 40%, #495057 80%, #212529 100%)'
                      : 'linear-gradient(135deg, #d90429 0%, #f77f00 35%, #fcbf49 70%, #eae2b7 100%)',
                }}
              >
                {/* Terrain topography SVG simulation lines */}
                <svg className="w-full h-full opacity-30 pointer-events-none" viewBox="0 0 128 128">
                  <path d="M0,30 Q30,45 60,35 T128,40" fill="none" stroke="#fff" strokeWidth="0.75" />
                  <path d="M0,60 Q40,75 80,65 T128,70" fill="none" stroke="#fff" strokeWidth="0.75" />
                  <path d="M0,90 Q50,105 90,95 T128,100" fill="none" stroke="#fff" strokeWidth="0.75" />
                  <path d="M40,0 Q55,40 45,80 T50,128" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2,2" />
                </svg>
              </div>

              {/* AI Prediction Mask Overlay */}
              {result && (
                <svg
                  className="absolute inset-0 w-full h-full pointer-events-none"
                  viewBox="0 0 128 128"
                  style={{ opacity: opacity / 100 }}
                >
                  <defs>
                    <radialGradient id="scarGrad" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#ef4444" stopOpacity="0.95" />
                      <stop offset="70%" stopColor="#f97316" stopOpacity="0.80" />
                      <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                    </radialGradient>
                  </defs>

                  {/* Render Landslide Hotspots from U-Net prediction */}
                  {result.hotspots.map((hotspot) => {
                    const [minX, minY, maxX, maxY] = hotspot.bbox;
                    const cx = (minX + maxX) / 2;
                    const cy = (minY + maxY) / 2;
                    const rx = (maxX - minX) / 2;
                    const ry = (maxY - minY) / 2;

                    return (
                      <g key={hotspot.id}>
                        {/* Probability Glow */}
                        <ellipse
                          cx={cx}
                          cy={cy}
                          rx={rx}
                          ry={ry}
                          fill="url(#scarGrad)"
                          className="animate-pulse"
                        />
                        {/* Bounding Box Outline */}
                        <rect
                          x={minX}
                          y={minY}
                          width={maxX - minX}
                          height={maxY - minY}
                          fill="none"
                          stroke={activeHotspot?.id === hotspot.id ? '#38bdf8' : '#ef4444'}
                          strokeWidth="0.8"
                          strokeDasharray={activeHotspot?.id === hotspot.id ? 'none' : '1.5,1.5'}
                        />
                        {/* Centroid Pin */}
                        <circle cx={cx} cy={cy} r="1.5" fill="#ffffff" stroke="#ef4444" strokeWidth="0.5" />
                        <text
                          x={minX}
                          y={Math.max(6, minY - 2)}
                          fill="#ffffff"
                          fontSize="4"
                          fontWeight="bold"
                          fontFamily="monospace"
                        >
                          {hotspot.confidence}% Prob
                        </text>
                      </g>
                    );
                  })}
                </svg>
              )}

              {/* Viewport HUD Overlays */}
              <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded text-[11px] font-mono text-white flex items-center gap-2 border border-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>128×128 Multispectral Frame</span>
              </div>

              <div className="absolute top-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded text-[11px] font-mono text-white flex items-center gap-2 border border-slate-700">
                <Compass className="w-3.5 h-3.5 text-sky-400" />
                <span>N 0°</span>
              </div>

              <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded text-[11px] font-mono text-white flex items-center gap-3 border border-slate-700">
                <span>Scale: 10m/px</span>
                <span>Coverage: 1.64 km²</span>
              </div>

              <div className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1.5 rounded text-[11px] font-mono text-white flex items-center gap-2 border border-slate-700">
                <span className="w-2 h-2 rounded bg-red-500" />
                <span>AI Detected Scars: {result?.hotspots.length || 0}</span>
              </div>
            </div>

            {/* Band Explanation Banner */}
            <div className="text-xs font-mono text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-center justify-between">
              <div>
                <strong className="text-slate-800">Current Band Display: </strong>
                {bandMode === 'rgb' && 'Sentinel-2 B4(Red), B3(Green), B2(Blue) — Natural True Color'}
                {bandMode === 'cir' && 'Sentinel-2 B8(NIR), B4(Red), B3(Green) — Vegetation Loss Contrast'}
                {bandMode === 'swir' && 'Sentinel-2 B11(SWIR), B8(NIR), B4(Red) — Soil Moisture & Mineral Exposure'}
                {bandMode === 'dem' && 'Digital Elevation Model (DEM) — Topographic Relief Elevation'}
                {bandMode === 'slope' && 'Topographic Slope Angle Map — Incline Instability Gradient'}
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 font-bold">14-Channel</span>
            </div>
          </div>

          {/* Telemetry Strip */}
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1">
                <Mountain className="w-3.5 h-3.5 text-slate-600" /> Slope Angle
              </span>
              <p className="text-lg font-bold text-slate-950">{sectorData.slope_deg}°</p>
              <span className="text-[10px] text-red-600 font-mono font-semibold">Critical (&gt;35°)</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1">
                <CloudRain className="w-3.5 h-3.5 text-blue-600" /> 24h Rainfall
              </span>
              <p className="text-lg font-bold text-slate-950">{sectorData.rainfall_24h_mm} mm</p>
              <span className="text-[10px] text-amber-600 font-mono font-semibold">Monsoon Surge</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-sky-600" /> Soil Moisture
              </span>
              <p className="text-lg font-bold text-slate-950">{sectorData.soil_moisture_pct}%</p>
              <span className="text-[10px] text-red-600 font-mono font-semibold">Over-Saturated</span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center space-y-1">
              <span className="text-[11px] font-mono text-slate-500 flex items-center justify-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-indigo-600" /> Elevation
              </span>
              <p className="text-lg font-bold text-slate-950">{sectorData.elevation_m} m</p>
              <span className="text-[10px] text-slate-500 font-mono font-semibold">Ridge Level</span>
            </div>
          </div>
        </div>

        {/* Right Column: AI Analytics & Actionable Protocols (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Inference Metrics Card */}
          {result && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-950">AI Detection Output</h3>
                  <p className="text-xs text-slate-500">U-Net Segmented Probability Map Analysis</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold ${
                    result.risk_level === 'CRITICAL'
                      ? 'bg-red-500/10 text-red-700 border border-red-500/30'
                      : 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
                  }`}
                >
                  {result.risk_level} RISK
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">Total Landslide Area</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">{result.total_area_ha}</span>
                    <span className="text-xs text-slate-600 font-semibold">ha</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono">({result.total_area_m2.toLocaleString()} m²)</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">Model Confidence</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-emerald-600">{result.overall_confidence}%</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono">Peak Prob: {result.peak_probability}%</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">Sector Landslide Density</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-slate-900">{result.coverage_percent}%</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono">of 128×128 scene</p>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-1">
                  <span className="text-xs text-slate-500 font-mono">Primary Detachments</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-2xl font-black text-red-600">{result.hotspots.length}</span>
                    <span className="text-xs text-slate-600 font-semibold">scars</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-mono">Active Clusters</p>
                </div>
              </div>

              {/* Detected Hotspot Cluster Selector */}
              <div className="space-y-3">
                <label className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider">
                  Active Detachment Clusters
                </label>
                <div className="space-y-2">
                  {result.hotspots.map((hotspot) => (
                    <div
                      key={hotspot.id}
                      onClick={() => setActiveHotspot(hotspot)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition ${
                        activeHotspot?.id === hotspot.id
                          ? 'border-sky-500 bg-sky-50/50 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-900">{hotspot.name}</span>
                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 font-bold">
                          {hotspot.confidence}% Conf
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mt-1 font-mono">
                        <span>Area: {hotspot.area_ha} ha ({hotspot.area_m2.toLocaleString()} m²)</span>
                        <span className="text-slate-400">GPS: {hotspot.centroid_geo.lat}, {hotspot.centroid_geo.lng}</span>
                      </div>
                      <div className="text-[11px] text-slate-600 mt-2 font-medium">
                        Threatened Assets: <strong className="text-slate-800">{hotspot.threatened_assets.join(', ')}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Active Hotspot Centroid GPS Action */}
              {activeHotspot && (
                <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 border border-slate-800">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">Primary Drone Dispatch GPS:</span>
                    <button
                      onClick={() => handleCopyCoords(activeHotspot.centroid_geo)}
                      className="text-xs font-mono px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-sky-400 transition"
                    >
                      {copiedCoords === `${activeHotspot.centroid_geo.lat}, ${activeHotspot.centroid_geo.lng}`
                        ? 'Copied to Clipboard!'
                        : 'Copy Lat, Lng'}
                    </button>
                  </div>
                  <div className="text-base font-mono font-bold text-sky-300">
                    {activeHotspot.centroid_geo.lat}° N, {activeHotspot.centroid_geo.lng}° E
                  </div>
                </div>
              )}

              {/* Action Recommendations Checklist */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <label className="text-xs font-mono font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                  <span>Authority Action Protocol</span>
                </label>
                <div className="space-y-2">
                  {result.action_recommendations.map((action, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-700"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
