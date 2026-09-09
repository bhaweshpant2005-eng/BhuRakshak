'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  CloudRain,
  Compass,
  ExternalLink,
  History,
  Info,
  Loader2,
  MapPin,
  PhoneCall,
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Thermometer,
  Wind,
} from 'lucide-react';
import { lookupPlaceRisk } from '@/lib/api/services';
import { HistoricalLandslide, PlaceRiskResult } from '@/lib/api/types';

const levelStyles: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MODERATE: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  UNAVAILABLE: 'bg-slate-100 text-slate-700 border-slate-300',
};

const SUGGESTED_PLACES = [
  { label: 'Ranikhet, Uttarakhand', query: 'Ranikhet, Uttarakhand', badge: 'Western Himalayas' },
  { label: 'Gangtok, Sikkim', query: 'Gangtok, Sikkim', badge: 'Monitored Zone' },
  { label: 'Sohra, Meghalaya', query: 'Sohra, Meghalaya', badge: 'High Monsoon' },
  { label: 'Aizawl, Mizoram', query: 'Aizawl, Mizoram', badge: 'Monitored Zone' },
  { label: 'Darjeeling, West Bengal', query: 'Darjeeling, West Bengal', badge: 'Slope Zone' },
  { label: 'Shimla, Himachal Pradesh', query: 'Shimla, Himachal Pradesh', badge: 'Western Himalayas' },
];

function eventDate(value: string | null) {
  if (!value) return 'Date unavailable';
  return new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

function HistoricalEvent({ event }: { event: HistoricalLandslide }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-slate-300">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-bold text-slate-900">{event.location}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {event.district}, {event.state} · {eventDate(event.date)}
          </p>
        </div>
        {event.distance_km !== undefined && (
          <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-0.5 text-[11px] font-bold text-sky-700">
            {event.distance_km} km away
          </span>
        )}
      </div>

      <dl className="mt-3.5 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
          <dt className="text-slate-500 text-[11px]">Rainfall</dt>
          <dd className="mt-0.5 font-bold text-slate-800">
            {event.rainfall_recorded_mm !== null && event.rainfall_recorded_mm !== undefined
              ? `${event.rainfall_recorded_mm} mm`
              : '—'}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
          <dt className="text-slate-500 text-[11px]">Slope</dt>
          <dd className="mt-0.5 font-bold text-slate-800">
            {event.slope_deg !== null && event.slope_deg !== undefined ? `${event.slope_deg}°` : '—'}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
          <dt className="text-slate-500 text-[11px]">Casualties</dt>
          <dd className={`mt-0.5 font-bold ${event.casualties > 0 ? 'text-red-600' : 'text-slate-800'}`}>
            {event.casualties}
          </dd>
        </div>
        <div className="rounded-lg bg-slate-50 p-2 border border-slate-100">
          <dt className="text-slate-500 text-[11px]">Certainty</dt>
          <dd className="mt-0.5 font-bold text-slate-800 capitalize">
            {(event.certainty ?? 'archived').replaceAll('_', ' ')}
          </dd>
        </div>
      </dl>

      {event.damage_summary && (
        <p className="mt-2.5 text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-700">Impact: </span>
          {event.damage_summary}
        </p>
      )}

      {event.source_name && (
        <p className="mt-2 text-[11px] text-slate-400 border-t border-slate-100 pt-2">
          Source: {event.source_name}
        </p>
      )}
    </article>
  );
}

export default function PlaceRiskPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaceRiskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addressInput, setAddressInput] = useState('');
  const [fetchWeather, setFetchWeather] = useState(true);

  async function performAssessment(query: string, withWeather = true) {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    const response = await lookupPlaceRisk(query.trim(), withWeather);
    setLoading(false);

    if (!response.ok) {
      setError(response.error);
      return;
    }
    setResult(response.data);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await performAssessment(addressInput, fetchWeather);
  }

  function selectSuggestion(query: string) {
    setAddressInput(query);
    void performAssessment(query, fetchWeather);
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <header className="border-b border-slate-200 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-slate-950">
              <MapPin className="size-6 text-sky-700" />
              Check Landslide Risk by Place
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Search any Indian hill town, district, or landmark to evaluate ground hazard, nearest telemetry stations, and live microclimate.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="inline-block size-2 rounded-full bg-emerald-500 animate-pulse" />
            Active Geocoding Engine
          </div>
        </div>
      </header>

      {/* Search Bar Section */}
      <section className="surface-card overflow-hidden border border-slate-200/80 shadow-sm">
        <div className="bg-gradient-to-br from-sky-800 via-sky-700 to-blue-900 p-6 text-white">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-xl font-bold">Where do you want to assess?</h2>
            <span className="text-xs text-sky-200">Covers Western & Eastern Himalayas, Western Ghats</span>
          </div>

          <form onSubmit={submit} className="mt-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
              <input
                name="address"
                required
                minLength={2}
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                className="w-full rounded-xl bg-white py-3 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none ring-sky-300 transition-all focus:ring-2 shadow-inner"
                placeholder="Enter hill town (e.g. Ranikhet, Gangtok, Sohra, Shimla, Darjeeling)"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-sky-900 shadow-md transition-all hover:bg-sky-50 active:scale-98 disabled:opacity-60"
            >
              {loading ? <Loader2 className="size-4 animate-spin text-sky-700" /> : <Search className="size-4 text-sky-700" />}
              Assess place
            </button>
            <label className="flex items-center gap-2 text-xs text-sky-100 sm:px-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fetchWeather}
                onChange={(e) => setFetchWeather(e.target.checked)}
                className="size-4 rounded border-sky-300 text-sky-600 focus:ring-sky-400"
              />
              Fetch live weather (Open-Meteo)
            </label>
          </form>

          {/* Quick suggestions pills */}
          <div className="mt-4 flex flex-wrap items-center gap-2 pt-2 border-t border-sky-600/50">
            <span className="text-xs font-semibold text-sky-200">Quick suggestions:</span>
            {SUGGESTED_PLACES.map((place) => (
              <button
                key={place.query}
                type="button"
                onClick={() => selectSuggestion(place.query)}
                className="group inline-flex items-center gap-1.5 rounded-lg bg-sky-900/40 border border-sky-400/30 px-2.5 py-1 text-xs font-medium text-sky-100 hover:bg-sky-50 hover:text-sky-900 hover:border-white transition-all shadow-xs"
              >
                <span>{place.label}</span>
                <span className="text-[10px] opacity-70 group-hover:opacity-100">({place.badge})</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="m-5 flex items-start gap-3 rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
            <AlertTriangle className="size-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Unable to complete assessment</p>
              <p className="mt-0.5 text-xs text-red-600">{error}</p>
            </div>
          </div>
        )}
      </section>

      {/* Results View */}
      {result && (
        <div className="space-y-6">
          {/* Matched place & Risk summary grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="surface-card p-6 md:col-span-2 border border-slate-200">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Matched Location</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">{result.display_name}</h2>
                </div>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${result.latitude}&mlon=${result.longitude}#map=13/${result.latitude}/${result.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-sky-700 hover:underline"
                >
                  View on map <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="mt-2 flex items-center gap-3 font-mono text-xs text-slate-500">
                <span className="inline-flex items-center gap-1">
                  <Compass className="size-3.5 text-slate-400" />
                  {result.latitude.toFixed(5)}° N, {result.longitude.toFixed(5)}° E
                </span>
                {result.regional_context?.elevation_approx_m && (
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[11px] text-slate-600 font-sans">
                    Elevation ~{result.regional_context.elevation_approx_m} m
                  </span>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-end gap-6 pt-4 border-t border-slate-100">
                <div>
                  <p className="text-xs font-semibold text-slate-500">Automated Risk Score</p>
                  <p className="text-4xl font-black tracking-tight text-slate-950">
                    {result.risk_score ?? '—'}
                    {result.risk_score !== null && <span className="text-lg font-bold text-slate-400">/100</span>}
                  </p>
                </div>
                <div className="pb-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-1.5 text-xs font-extrabold ${levelStyles[result.risk_level]}`}>
                    {result.risk_level === 'CRITICAL' && <ShieldAlert className="size-4" />}
                    {result.risk_level === 'HIGH' && <AlertTriangle className="size-4" />}
                    {result.risk_level === 'LOW' && <ShieldCheck className="size-4" />}
                    {result.risk_level === 'UNAVAILABLE' && <Info className="size-4 text-slate-500" />}
                    {result.risk_level}
                  </span>
                </div>
                <div className="pb-1">
                  <p className="text-xs font-semibold text-slate-500">Sensor Confidence</p>
                  <p className="font-mono text-xl font-bold text-slate-800">{Math.round(result.confidence)}%</p>
                </div>
              </div>
            </div>

            {/* Nearest Monitored Zone Card */}
            <div className="surface-card p-6 border border-slate-200 flex flex-col justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-sky-700">Nearest Telemetry Station</p>
                {result.matched_zone ? (
                  <div className="mt-3">
                    <h3 className="font-bold text-base text-slate-950">{result.matched_zone.name}</h3>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {result.matched_zone.district}, {result.matched_zone.state}
                    </p>
                    <div className="mt-4 rounded-lg bg-sky-50 border border-sky-100 p-3">
                      <p className="text-xs font-medium text-sky-800">
                        <span className="font-bold text-sky-950 text-base">{result.distance_km} km</span> from searched coordinates
                      </p>
                      <p className="mt-1 text-[11px] text-sky-700">Within operational telemetry radius (≤150 km).</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <h3 className="font-bold text-slate-900">Beyond Core NER Grid</h3>
                    <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                      Nearest monitored station is <span className="font-bold text-slate-900">{result.distance_km ?? '>150'} km</span> away.
                      Ground sensor telemetry is unavailable for automated scoring.
                    </p>
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2.5 text-[11px] text-amber-800">
                      Pilots are currently anchored in Northeast India (Sikkim, Meghalaya, Mizoram).
                    </div>
                  </div>
                )}
              </div>

              {result.matched_zone && (
                <Link
                  href={`/dashboard/zones/${result.matched_zone.zone_id}`}
                  className="mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg bg-sky-50 px-3 py-2 text-xs font-bold text-sky-700 hover:bg-sky-100 transition-colors"
                >
                  Inspect telemetry evidence <ArrowUpRight className="size-3.5" />
                </Link>
              )}
            </div>
          </div>

          {/* Regional Sector Intelligence Card (Especially informative for Western Himalayas like Ranikhet) */}
          {result.regional_context && (
            <div className="surface-card p-6 border border-sky-100 bg-gradient-to-r from-sky-50/50 via-white to-blue-50/30">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 border border-sky-200 px-3 py-1 text-xs font-bold text-sky-800">
                    <MapPin className="size-3.5 text-sky-700" />
                    {result.regional_context.sector}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-slate-950">
                    Regional Geological & Disaster Profile: {result.regional_context.district}, {result.regional_context.state}
                  </h3>
                  <p className="mt-1 text-xs text-slate-600 max-w-3xl leading-relaxed">
                    {result.regional_context.regional_hazard}
                  </p>
                </div>

                {/* Emergency Hotlines Box */}
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 shadow-xs">
                  <p className="flex items-center gap-1.5 text-xs font-bold text-rose-900">
                    <PhoneCall className="size-3.5 text-rose-600" />
                    Regional Disaster Response Helplines
                  </p>
                  <div className="mt-2.5 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600">State Control Room (SEOC):</span>
                      <a href={`tel:${result.regional_context.helpline_seoc.split(' ')[0]}`} className="font-bold text-rose-700 hover:underline">
                        {result.regional_context.helpline_seoc}
                      </a>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-slate-600">District Authority (DDMA):</span>
                      <a href={`tel:${result.regional_context.helpline_ddma.split(' ')[0]}`} className="font-bold text-rose-700 hover:underline">
                        {result.regional_context.helpline_ddma}
                      </a>
                    </div>
                    <div className="flex items-center justify-between gap-4 border-t border-rose-200/60 pt-1.5">
                      <span className="text-slate-600">National Unified Emergency:</span>
                      <a href="tel:112" className="font-extrabold text-rose-800 hover:underline">
                        112 / 100
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Live Microclimate & Weather Card (Open-Meteo Integration) */}
          {result.weather_data && (
            <section className="surface-card p-6 border border-slate-200">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h3 className="flex items-center gap-2 font-bold text-slate-950">
                    <CloudRain className="size-5 text-sky-600" />
                    Live Microclimate & Precipitation (Open-Meteo)
                  </h3>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Real-time meteorological observations for {result.display_name.split(',')[0]} coordinates
                  </p>
                </div>
                {result.weather_data.recorded_at && (
                  <span className="rounded bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                    Synced: {result.weather_data.recorded_at}
                  </span>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Thermometer className="size-4 text-amber-500" />
                    Temperature
                  </div>
                  <p className="mt-1 text-2xl font-black text-slate-900">{result.weather_data.temperature_c}°C</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">{result.weather_data.weather_desc}</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <CloudRain className="size-4 text-sky-500" />
                    Precipitation
                  </div>
                  <p className="mt-1 text-2xl font-black text-slate-900">{result.weather_data.rainfall_current_mm} mm</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Current hourly rate</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Wind className="size-4 text-teal-500" />
                    Wind Velocity
                  </div>
                  <p className="mt-1 text-2xl font-black text-slate-900">{result.weather_data.wind_speed_kmh} km/h</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Surface gradient wind</p>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/80 p-3.5">
                  <div className="flex items-center gap-2 text-slate-500 text-xs">
                    <Info className="size-4 text-indigo-500" />
                    Relative Humidity
                  </div>
                  <p className="mt-1 text-2xl font-black text-slate-900">{result.weather_data.humidity_percent}%</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Atmospheric moisture</p>
                </div>
              </div>
            </section>
          )}

          {/* Historical Landslides Section */}
          <section className="surface-card p-6 border border-slate-200">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="flex items-center gap-2 font-bold text-slate-950">
                  <History className="size-5 text-amber-600" />
                  Nearby Historical Landslides & Archive Records
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Documented geological failure events within {result.historical_landslides.search_radius_km} km radius.
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  result.historical_landslides.total_nearby
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : 'border-slate-200 bg-slate-50 text-slate-600'
                }`}
              >
                {result.historical_landslides.total_nearby} nearby record
                {result.historical_landslides.total_nearby === 1 ? '' : 's'}
              </span>
            </div>

            {result.historical_landslides.events.length > 0 ? (
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {result.historical_landslides.events.map((item) => (
                  <HistoricalEvent key={item.id} event={item} />
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                No recorded event in the immediate search radius catalogue.
              </p>
            )}

            <p className="mt-4 flex gap-2 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5 text-xs text-amber-900">
              <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-700" />
              {result.historical_landslides.disclaimer}
            </p>
          </section>

          {/* Explainability & Feature State Details */}
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="surface-card p-6 border border-slate-200">
              <h3 className="flex items-center gap-2 font-bold text-slate-950">
                <ShieldQuestion className="size-5 text-sky-700" />
                Explainable Decision Factors
              </h3>
              <ul className="mt-4 space-y-2.5">
                {result.reasons.map((reason) => (
                  <li key={reason} className="flex gap-2.5 text-xs sm:text-sm text-slate-700 leading-relaxed">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-600" />
                    <span>{reason}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="surface-card p-6 border border-slate-200">
              <h3 className="flex items-center gap-2 font-bold text-slate-950">
                <CloudRain className="size-5 text-sky-700" />
                Evidence & Provenance State
              </h3>
              <dl className="mt-4 space-y-3.5 text-xs sm:text-sm">
                <div className="flex justify-between border-b border-slate-100 pb-2.5">
                  <dt className="text-slate-500">Data Provenance</dt>
                  <dd className="font-bold text-slate-800 capitalize">{result.provenance.replaceAll('_', ' ')}</dd>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2.5">
                  <dt className="text-slate-500">Weather Telemetry Refresh</dt>
                  <dd className="max-w-[65%] text-right font-semibold text-slate-800">
                    {result.weather_refresh_error ?? result.weather_refresh?.status ?? 'Live Open-Meteo Synced'}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-500">Missing Sensor Features</dt>
                  <dd className="max-w-[65%] text-right font-semibold text-slate-800">
                    {result.missing_features.length ? result.missing_features.join(', ') : 'None (Core sensors active)'}
                  </dd>
                </div>
              </dl>
            </section>
          </div>

          {/* Safety Advisory Banner */}
          <div className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 shadow-xs">
            <AlertTriangle className="size-5 shrink-0 text-amber-700 mt-0.5" />
            <div>
              <p className="font-bold">Official Disaster Advisory Notice</p>
              <p className="mt-0.5 text-xs text-amber-800 leading-relaxed">
                {result.disclaimer} Always follow guidelines issued by District Disaster Management Authorities (DDMA) and State Emergency Operations Centres.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
