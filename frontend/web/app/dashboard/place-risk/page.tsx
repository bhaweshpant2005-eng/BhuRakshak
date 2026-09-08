'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  CheckCircle2,
  CloudRain,
  History,
  Loader2,
  MapPin,
  Search,
  ShieldQuestion,
} from 'lucide-react';
import { lookupPlaceRisk } from '@/lib/api/services';
import { HistoricalLandslide, PlaceRiskResult } from '@/lib/api/types';

const levelStyles: Record<string, string> = {
  LOW: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  MODERATE: 'bg-amber-50 text-amber-700 border-amber-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  CRITICAL: 'bg-red-50 text-red-700 border-red-200',
  UNAVAILABLE: 'bg-slate-50 text-slate-600 border-slate-200',
};

function eventDate(value: string | null) {
  if (!value) return 'Date unavailable';
  return new Date(value).toLocaleDateString();
}

function HistoricalEvent({ event }: { event: HistoricalLandslide }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-slate-900">{event.location}</p>
          <p className="mt-0.5 text-xs text-slate-500">
            {event.district}, {event.state} · {eventDate(event.date)}
          </p>
        </div>
        {event.distance_km !== undefined && (
          <span className="rounded border border-sky-200 bg-sky-50 px-2 py-1 text-[10px] font-bold text-sky-700">
            {event.distance_km} km away
          </span>
        )}
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
        <div><dt className="text-slate-500">Rainfall</dt><dd className="font-semibold text-slate-800">{event.rainfall_recorded_mm ?? '—'}{event.rainfall_recorded_mm !== null ? ' mm' : ''}</dd></div>
        <div><dt className="text-slate-500">Slope</dt><dd className="font-semibold text-slate-800">{event.slope_deg ?? '—'}{event.slope_deg !== null ? '°' : ''}</dd></div>
        <div><dt className="text-slate-500">Casualties</dt><dd className="font-semibold text-slate-800">{event.casualties}</dd></div>
        <div><dt className="text-slate-500">Provenance</dt><dd className="font-semibold text-slate-800">{(event.provenance ?? 'unavailable').replaceAll('_', ' ')}</dd></div>
      </dl>
      {(event.source_name || event.certainty) && (
        <p className="mt-2 text-[11px] text-slate-500">
          {event.source_name ?? 'Source unavailable'}{event.certainty ? ` · ${event.certainty.replaceAll('_', ' ')}` : ''}
        </p>
      )}
    </article>
  );
}

export default function PlaceRiskPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PlaceRiskResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const address = String(data.get('address') || '').trim();
    if (!address) return;
    setLoading(true);
    setError(null);
    setResult(null);
    const response = await lookupPlaceRisk(address, data.get('refreshWeather') === 'on');
    setLoading(false);
    if (!response.ok) {
      setError(response.error);
      return;
    }
    setResult(response.data);
  }

  return (
    <div className="space-y-6 pb-12">
      <header className="border-b border-slate-200 pb-5">
        <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-950">
          <MapPin className="size-6 text-sky-700" />Check Landslide Risk by Place
        </h1>
        <p className="mt-1 text-sm text-slate-500">Search an Indian address and compare it with monitored Northeast risk zones and the current historical-event catalogue.</p>
      </header>
      <section className="surface-card overflow-hidden">
        <div className="bg-gradient-to-br from-sky-700 to-blue-900 p-6 text-white">
          <h2 className="text-xl font-bold">Where do you want to assess?</h2>
          <p className="mt-1 text-sm text-sky-100">Examples: Gangtok, Sikkim; Aizawl, Mizoram; Sohra, Meghalaya.</p>
          <form onSubmit={submit} className="mt-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 size-4 text-slate-400" />
              <input name="address" required minLength={3} className="w-full rounded-lg bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none ring-sky-300 focus:ring-2" placeholder="Enter village, town, district, landmark, or address" />
            </div>
            <button disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-sky-800 disabled:opacity-60">
              {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}Assess place
            </button>
            <label className="flex items-center gap-2 text-xs text-sky-100 sm:px-2"><input name="refreshWeather" type="checkbox" />Fetch current modelled weather</label>
          </form>
        </div>
        {error && <p className="m-5 rounded-lg bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      </section>
      {result && (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="surface-card p-5 md:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Matched place</p>
              <h2 className="mt-2 text-lg font-bold text-slate-950">{result.display_name}</h2>
              <p className="mt-1 font-mono text-xs text-slate-500">{result.latitude.toFixed(5)}, {result.longitude.toFixed(5)}</p>
              <div className="mt-5 flex flex-wrap items-end gap-4">
                <div><p className="text-xs text-slate-500">Estimated risk</p><p className="text-4xl font-extrabold text-slate-950">{result.risk_score ?? '—'}{result.risk_score !== null && <span className="text-lg text-slate-400">/100</span>}</p></div>
                <span className={`rounded-lg border px-3 py-2 text-xs font-bold ${levelStyles[result.risk_level]}`}>{result.risk_level}</span>
                <div><p className="text-xs text-slate-500">Confidence</p><p className="font-mono font-bold text-slate-800">{Math.round(result.confidence)}%</p></div>
              </div>
            </div>
            <div className="surface-card p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-sky-700">Nearest monitored zone</p>
              {result.matched_zone ? <><h3 className="mt-2 font-bold text-slate-950">{result.matched_zone.name}</h3><p className="mt-1 text-xs text-slate-500">{result.matched_zone.district}, {result.matched_zone.state}</p><p className="mt-4 text-sm font-semibold text-slate-700">{result.distance_km} km from searched place</p><Link href={`/dashboard/zones/${result.matched_zone.zone_id}`} className="mt-4 inline-flex text-xs font-bold text-sky-700">Open zone evidence →</Link></> : <p className="mt-3 text-sm text-slate-600">No monitored zone within 150 km. Risk remains unavailable, not low.</p>}
            </div>
          </div>
          <section className="surface-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div><h2 className="flex items-center gap-2 font-bold text-slate-950"><History className="size-5 text-amber-600" />Nearby historical landslides</h2><p className="mt-1 text-xs text-slate-500">Database records within {result.historical_landslides.search_radius_km} km of the searched coordinates.</p></div>
              <span className={`rounded border px-2.5 py-1 text-xs font-bold ${result.historical_landslides.total_nearby ? 'border-amber-200 bg-amber-50 text-amber-700' : 'border-slate-200 bg-slate-50 text-slate-600'}`}>{result.historical_landslides.total_nearby} record{result.historical_landslides.total_nearby === 1 ? '' : 's'} found</span>
            </div>
            {result.historical_landslides.events.length > 0 ? <div className="mt-4 grid gap-3 lg:grid-cols-2">{result.historical_landslides.events.map((item) => <HistoricalEvent key={item.id} event={item} />)}</div> : <p className="mt-4 rounded-lg bg-slate-50 p-4 text-sm text-slate-600">No nearby event appears in the current catalogue.</p>}
            <p className="mt-4 flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{result.historical_landslides.disclaimer}</p>
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold text-slate-950"><ShieldQuestion className="size-5 text-sky-700" />Why this result?</h2><ul className="mt-4 space-y-2">{result.reasons.map((reason) => <li key={reason} className="flex gap-2 text-sm text-slate-700"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-sky-600" />{reason}</li>)}</ul></section>
            <section className="surface-card p-5"><h2 className="flex items-center gap-2 font-bold text-slate-950"><CloudRain className="size-5 text-sky-700" />Evidence state</h2><dl className="mt-4 space-y-3 text-sm"><div className="flex justify-between"><dt className="text-slate-500">Provenance</dt><dd className="font-semibold text-slate-800">{result.provenance.replaceAll('_', ' ')}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Weather refresh</dt><dd className="max-w-[60%] text-right font-semibold text-slate-800">{result.weather_refresh_error ?? result.weather_refresh?.status ?? 'Not requested'}</dd></div><div className="flex justify-between"><dt className="text-slate-500">Missing features</dt><dd className="max-w-[60%] text-right font-semibold text-slate-800">{result.missing_features.length ? result.missing_features.join(', ') : 'None reported'}</dd></div></dl></section>
          </div>
          <p className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><AlertTriangle className="mt-0.5 size-4 shrink-0" />{result.disclaimer} Do not use this screen alone for evacuation or public-warning decisions.</p>
        </>
      )}
    </div>
  );
}
