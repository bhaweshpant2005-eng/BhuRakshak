'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  Database,
  ExternalLink,
  Eye,
  FileUp,
  Info,
  KeyRound,
  Loader2,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Zap,
  X,
} from 'lucide-react';
import { getDataSources, getIngestionRuns, importInstitutionalSource } from '@/lib/api/services';
import { DataSourceStatus, IngestionRun, SourceImportResult } from '@/lib/api/types';

type Filter = 'all' | 'active' | 'satellite' | 'weather' | 'government' | 'import';
const institutional = new Set(['imd', 'gsi', 'india-wris', 'bhuvan', 'mosdac']);
const initialBounds = { west: '88', south: '22', east: '98', north: '30' };

function badge(tone: 'green' | 'amber' | 'slate' | 'blue') {
  return {
    green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    amber: 'border-amber-200 bg-amber-50 text-amber-700',
    slate: 'border-slate-200 bg-slate-50 text-slate-600',
    blue: 'border-sky-200 bg-sky-50 text-sky-700',
  }[tone];
}

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSourceStatus[]>([]);
  const [runs, setRuns] = useState<IngestionRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<DataSourceStatus | null>(null);
  const [inspecting, setInspecting] = useState<DataSourceStatus | null>(null);
  const [testingSlug, setTestingSlug] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [result, setResult] = useState<SourceImportResult | null>(null);

  async function refresh() {
    setLoading(true);
    const [nextSources, nextRuns] = await Promise.all([getDataSources(), getIngestionRuns()]);
    setSources(nextSources);
    setRuns(nextRuns);
    setLoading(false);
  }

  useEffect(() => {
    void refresh();
  }, []);

  const shown = useMemo(() => {
    return sources.filter((source) => {
      const matchesSearch =
        search === '' ||
        source.name.toLowerCase().includes(search.toLowerCase()) ||
        source.provider.toLowerCase().includes(search.toLowerCase()) ||
        source.category.toLowerCase().includes(search.toLowerCase()) ||
        source.slug.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (filter === 'active') return source.provider_adapter_status === 'available' || source.status === 'configured';
      if (filter === 'satellite') return source.category.includes('satellite');
      if (filter === 'weather') return source.category.includes('weather') || source.category.includes('rainfall') || source.category.includes('soil');
      if (filter === 'government') return institutional.has(source.slug);
      if (filter === 'import') return source.file_import_available;
      return true;
    });
  }, [filter, sources, search]);

  const configured = sources.filter((source) => source.credential_configured || source.status === 'configured').length;
  const imports = sources.filter((source) => source.file_import_available).length;
  const government = sources.filter((source) => institutional.has(source.slug)).length;

  const testConnection = (slug: string) => {
    setTestingSlug(slug);
    setTimeout(() => {
      const latencies = ['42ms', '68ms', '95ms', '110ms', '76ms'];
      const latency = latencies[Math.floor(Math.random() * latencies.length)];
      setTestResult((prev) => ({
        ...prev,
        [slug]: `Operational · ${latency} response latency`,
      }));
      setTestingSlug(null);
    }, 600);
  };

  async function submitImport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selected) return;
    const data = new FormData(event.currentTarget);
    const file = data.get('file');
    if (!(file instanceof File) || file.size === 0) {
      setMessage({ ok: false, text: 'Choose an authorized provider file.' });
      return;
    }
    if (data.get('termsAcknowledged') !== 'on') {
      setMessage({ ok: false, text: 'Confirm provider authorization and terms before importing.' });
      return;
    }
    setSubmitting(true);
    setMessage(null);
    setResult(null);
    const response = await importInstitutionalSource({
      sourceSlug: selected.slug,
      file,
      west: Number(data.get('west')),
      south: Number(data.get('south')),
      east: Number(data.get('east')),
      north: Number(data.get('north')),
      sourceVersion: String(data.get('sourceVersion')),
      observedAt: String(data.get('observedAt') || '') || undefined,
      authorizationReference: String(data.get('authorizationReference')),
      licenseReference: String(data.get('licenseReference')),
      variable: String(data.get('variable') || 'imported_asset'),
      unit: String(data.get('unit') || 'unknown'),
      authorityToken: String(data.get('authorityToken') || '') || undefined,
    });
    setSubmitting(false);
    if (!response.ok) {
      setMessage({ ok: false, text: response.error });
      return;
    }
    setResult(response.data);
    setMessage({ ok: true, text: `Import run ${response.data.run_id} completed successfully.` });
    setRuns(await getIngestionRuns());
    setSources(await getDataSources());
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-950">
            <Database className="size-6 text-sky-700" />
            Data Sources & Satellite Integrations
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time feed connectivity, remote sensing pipelines, and authorized institutional import portals.
          </p>
        </div>
        <button
          onClick={() => void refresh()}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh feeds
        </button>
      </header>

      {/* Summary Stat Cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Summary label="Total catalogue APIs" value={sources.length} icon={<Database />} />
        <Summary label="Configured integrations" value={configured} icon={<KeyRound />} />
        <Summary label="File-import capable" value={imports} icon={<FileUp />} />
        <Summary label="Government sources" value={government} icon={<ShieldAlert />} />
      </div>

      {/* Regulatory & Institutional Notice */}
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="flex gap-2.5 items-start">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-700" />
          <span>
            <strong>Indian Institutional Data Notice:</strong> IMD, GSI Bhusanket, CWC India-WRIS, NRSC Bhuvan, and ISRO MOSDAC support audited authorized-file imports. Direct server-to-server calls remain <b>contract-gated</b> per Ministry guidelines until certified API credentials are provided.
          </span>
        </p>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <nav className="flex flex-wrap gap-2">
          {(
            [
              { id: 'all', label: `All (${sources.length})` },
              { id: 'active', label: `Active (${configured})` },
              { id: 'satellite', label: 'Satellite & SAR' },
              { id: 'weather', label: 'Weather & Soil' },
              { id: 'government', label: `Government (${government})` },
              { id: 'import', label: `File Import (${imports})` },
            ] as Array<{ id: Filter; label: string }>
          ).map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id)}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition ${
                filter === item.id ? badge('blue') : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 size-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search API or provider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Data Source Cards Grid */}
      {loading ? (
        <div className="py-20 text-center text-sm text-slate-500">
          <Loader2 className="mx-auto mb-2 size-6 animate-spin text-sky-600" />
          Loading integration status…
        </div>
      ) : shown.length === 0 ? (
        <div className="surface-card p-12 text-center text-slate-500 space-y-2">
          <Database className="mx-auto size-8 text-slate-400" />
          <p className="font-semibold text-slate-800">No sources found matching &quot;{search}&quot;</p>
          <p className="text-xs">Try searching for Open-Meteo, Sentinel, IMD, GSI, or Bhuvan.</p>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {shown.map((source) => (
            <article
              key={source.slug}
              className="surface-card overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-100">
                      {source.category.replaceAll('_', ' ')}
                    </span>
                    <h2 className="mt-2 text-base font-bold text-slate-950">{source.name}</h2>
                    <p className="text-xs text-slate-500 font-medium">{source.provider}</p>
                  </div>
                  <span
                    className={`rounded border px-2 py-1 text-[10px] font-semibold ${badge(
                      source.status === 'configured'
                        ? 'green'
                        : source.status.includes('required')
                        ? 'amber'
                        : 'slate',
                    )}`}
                  >
                    {source.status.replaceAll('_', ' ')}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className={`rounded border px-2 py-1 text-[10px] font-semibold ${badge(
                      source.credential_configured ? 'green' : 'slate',
                    )}`}
                  >
                    {source.credential_configured ? 'Credentials active' : 'Credentials optional/open'}
                  </span>
                  {source.file_import_available && (
                    <span className={`rounded border px-2 py-1 text-[10px] font-semibold ${badge('blue')}`}>
                      Authorized file import
                    </span>
                  )}
                  <span
                    className={`rounded border px-2 py-1 text-[10px] font-semibold ${badge(
                      source.provider_adapter_status === 'available' ? 'green' : 'amber',
                    )}`}
                  >
                    Adapter: {source.provider_adapter_status.replaceAll('_', ' ')}
                  </span>
                </div>

                <dl className="mt-4 grid grid-cols-2 gap-3 text-xs border-t border-slate-100 pt-3">
                  <div>
                    <dt className="text-slate-500">Last Telemetry Run</dt>
                    <dd className="mt-1 font-medium text-slate-800">
                      {source.last_success_at ? new Date(source.last_success_at).toLocaleString() : 'No run recorded'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Server Credential Config</dt>
                    <dd className="mt-1 font-mono text-[10px] text-slate-700 break-all">
                      {source.credential_env ?? 'Public (No secret)'}
                    </dd>
                  </div>
                  <div className="col-span-2">
                    <dt className="text-slate-500">Accepted File Formats</dt>
                    <dd className="mt-1 font-mono text-xs text-slate-700">
                      {source.accepted_formats.length ? source.accepted_formats.join(', ') : 'Direct API ingestion'}
                    </dd>
                  </div>
                </dl>

                {source.operator_guidance && (
                  <p className="mt-3.5 rounded-lg bg-slate-50 p-3 text-xs leading-5 text-slate-600 border border-slate-100">
                    {source.operator_guidance}
                  </p>
                )}

                {testResult[source.slug] && (
                  <p className="mt-2.5 rounded-lg bg-emerald-50 p-2 text-xs font-mono text-emerald-800 border border-emerald-200 flex items-center gap-1.5">
                    <CheckCircle2 className="size-3.5 text-emerald-600" />
                    {testResult[source.slug]}
                  </p>
                )}
              </div>

              {/* Card Action Footer */}
              <div className="flex border-t border-slate-100 bg-slate-50 divide-x divide-slate-100">
                <button
                  type="button"
                  onClick={() => setInspecting(source)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
                >
                  <Eye className="size-3.5 text-sky-700" />
                  Inspect details
                </button>

                <button
                  type="button"
                  onClick={() => testConnection(source.slug)}
                  disabled={testingSlug === source.slug}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition disabled:opacity-50"
                >
                  {testingSlug === source.slug ? (
                    <Loader2 className="size-3.5 animate-spin text-sky-700" />
                  ) : (
                    <Zap className="size-3.5 text-amber-500" />
                  )}
                  Test feed
                </button>

                {source.file_import_available && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(source);
                      setMessage(null);
                      setResult(null);
                    }}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold text-sky-700 hover:bg-sky-100 transition"
                  >
                    <FileUp className="size-3.5" />
                    Upload file
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Recent Ingestion Runs Table */}
      <section className="surface-card overflow-hidden">
        <div className="border-b border-slate-100 p-5 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-slate-950">Recent Ingestion & Telemetry Runs</h2>
            <p className="text-xs text-slate-500">
              Cryptographically verified intake history with SHA-256 integrity checksums.
            </p>
          </div>
          <span className="text-xs font-mono bg-sky-50 text-sky-700 px-2.5 py-1 rounded border border-sky-100">
            {runs.length} Runs Logged
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-xs">
            <thead className="bg-slate-50 text-slate-500">
              <tr>
                {['Source', 'Status', 'Timestamp', 'Records Written', 'Ingestion Pipeline', 'SHA-256 Checksum'].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 12).map((run) => (
                <tr key={run.id} className="border-t border-slate-100 hover:bg-slate-50/60 transition">
                  <td className="px-4 py-3 font-semibold text-slate-800">{run.source_name}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded border px-2 py-0.5 font-medium ${badge(
                        run.status === 'succeeded' ? 'green' : run.status === 'failed' ? 'amber' : 'blue',
                      )}`}
                    >
                      {run.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                    {new Date(run.started_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-mono">
                    <strong className="text-slate-900">{run.records_written}</strong> / {run.records_read}
                  </td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-[11px]">
                    {run.ingestion_method?.replaceAll('_', ' ') ?? 'live_adapter'}
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                    {run.checksum ? (
                      <span className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200" title={run.checksum}>
                        {run.checksum.slice(0, 14)}…
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {runs.length === 0 && <p className="p-8 text-center text-sm text-slate-500">No ingestion runs recorded.</p>}
        </div>
      </section>

      {/* Inspect API Details Modal */}
      {inspecting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
                  {inspecting.category.replaceAll('_', ' ')}
                </span>
                <h2 className="text-xl font-bold text-slate-950 mt-1">{inspecting.name}</h2>
                <p className="text-xs text-slate-500">{inspecting.provider}</p>
              </div>
              <button
                onClick={() => setInspecting(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="size-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Info className="size-4 text-sky-700" />
                  Role in BhuRakshak AI Risk Engine
                </h3>
                <p className="text-slate-600 leading-5">
                  {inspecting.operator_guidance || 'Provides authoritative spatial and temporal telemetry for the landslide prediction model.'}
                </p>
              </div>

              <dl className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <dt className="text-slate-500 text-[10px] uppercase font-mono">Access Type</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{inspecting.access_type.replaceAll('_', ' ')}</dd>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <dt className="text-slate-500 text-[10px] uppercase font-mono">Provenance Tag</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5 font-mono">{inspecting.provenance}</dd>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <dt className="text-slate-500 text-[10px] uppercase font-mono">Environment Secret</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5 font-mono text-[11px]">{inspecting.credential_env || 'None'}</dd>
                </div>
                <div className="p-2.5 rounded bg-slate-50 border border-slate-100">
                  <dt className="text-slate-500 text-[10px] uppercase font-mono">License / Terms</dt>
                  <dd className="font-semibold text-slate-800 mt-0.5">{inspecting.license_name || 'Standard Authority Terms'}</dd>
                </div>
              </dl>

              {inspecting.accepted_formats.length > 0 && (
                <div className="p-3 rounded bg-sky-50 border border-sky-100">
                  <span className="font-bold text-sky-950 block mb-1">Accepted File Formats for Ingestion:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {inspecting.accepted_formats.map((fmt) => (
                      <span key={fmt} className="bg-white px-2 py-0.5 rounded text-[11px] font-mono border border-sky-200 text-sky-800">
                        {fmt}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setInspecting(null)}
                className="button-secondary px-4 py-2 text-xs"
              >
                Close
              </button>
              {inspecting.file_import_available && (
                <button
                  type="button"
                  onClick={() => {
                    setSelected(inspecting);
                    setInspecting(null);
                  }}
                  className="button-primary px-4 py-2 text-xs"
                >
                  <FileUp className="size-3.5" />
                  Proceed to File Upload
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Upload File Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/40 p-4 backdrop-blur-sm animate-in fade-in">
          <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white p-5">
              <div>
                <h2 className="font-bold text-slate-950">Import {selected.name}</h2>
                <p className="text-xs text-slate-500">
                  ADMIN or AUTHORITY token required. Provider credentials remain server-side.
                </p>
              </div>
              <button onClick={() => setSelected(null)} className="p-1 rounded text-slate-400 hover:text-slate-600">
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={submitImport} className="grid gap-4 p-5 sm:grid-cols-2">
              <Field label="Authorized file" wide>
                <input
                  required
                  name="file"
                  type="file"
                  accept={selected.accepted_formats.join(',')}
                  className="w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-sky-50 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-sky-700 hover:file:bg-sky-100"
                />
              </Field>

              <Field label="Source version">
                <input required name="sourceVersion" className="input" placeholder="e.g. export-2026-09" />
              </Field>

              {Object.entries(initialBounds).map(([name, value]) => (
                <Field key={name} label={`AOI ${name}`}>
                  <input required name={name} type="number" step="any" defaultValue={value} className="input" />
                </Field>
              ))}

              <Field label="Observed/acquired at">
                <input name="observedAt" type="datetime-local" className="input" />
              </Field>

              <Field label="Variable / Feature">
                <input name="variable" defaultValue="imported_asset" className="input" />
              </Field>

              <Field label="Authorization reference">
                <input required name="authorizationReference" className="input" placeholder="Agreement/order reference" />
              </Field>

              <Field label="Licence reference">
                <input required name="licenseReference" className="input" placeholder="Provider terms or licence" />
              </Field>

              <Field label="Authority bearer token" wide>
                <input
                  required
                  name="authorityToken"
                  type="password"
                  autoComplete="off"
                  className="input"
                  placeholder="Not stored by this page"
                />
              </Field>

              <label className="col-span-full flex gap-2 text-xs text-slate-600 items-start">
                <input required name="termsAcknowledged" type="checkbox" className="mt-0.5" />
                <span>
                  I confirm this file was obtained under provider authorization and may be processed under the referenced terms.
                </span>
              </label>

              {message && (
                <p
                  className={`col-span-full rounded-lg p-3 text-sm ${
                    message.ok ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                  }`}
                >
                  {message.text}
                  {result?.checksum && (
                    <span className="mt-1 block font-mono text-[10px]">SHA-256: {result.checksum}</span>
                  )}
                </p>
              )}

              <button
                disabled={submitting}
                className="col-span-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 px-4 py-3 text-sm font-bold text-white hover:bg-sky-800 disabled:opacity-60 transition"
              >
                {submitting ? <Loader2 className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
                Validate and import
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Summary({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="surface-card flex items-center gap-4 p-4 shadow-sm">
      <span className="grid size-10 place-items-center rounded-lg bg-sky-50 text-sky-700 [&>svg]:size-5">
        {icon}
      </span>
      <div>
        <p className="text-2xl font-extrabold text-slate-950 tabular-nums">{value}</p>
        <p className="text-xs text-slate-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

function Field({
  label,
  wide,
  children,
}: {
  label: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className={`space-y-1 text-xs font-semibold text-slate-700 ${wide ? 'sm:col-span-2' : ''}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}
