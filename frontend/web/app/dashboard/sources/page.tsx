'use client';

import { useEffect, useState } from 'react';
import { Database, ExternalLink, Radio, ShieldAlert } from 'lucide-react';
import { getDataSources } from '@/lib/api/services';
import { DataSourceStatus } from '@/lib/api/types';

const provenanceLabels: Record<string, string> = {
  live_observed: 'Live observed',
  live_modelled: 'Live modelled',
  cached_observed: 'Cached observed',
  cached_modelled: 'Cached modelled',
  derived: 'Derived',
  static_reference: 'Static reference',
  prepared_demo: 'Prepared demo',
  synthetic_demo: 'Synthetic demo',
  unavailable: 'Unavailable',
};

function statusClasses(status: string) {
  if (status === 'configured' || status === 'import_available') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'authorization_required') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

export default function DataSourcesPage() {
  const [sources, setSources] = useState<DataSourceStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDataSources().then((data) => {
      setSources(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold text-slate-950">
            <Database className="size-6 text-sky-700" />
            Data Sources & Provenance
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Access state, evidence classification, freshness, licence and current provider errors.
          </p>
        </div>
        <span className="rounded border border-sky-100 bg-sky-50 px-3 py-1.5 font-mono text-xs text-sky-700">
          {sources.length} source descriptors
        </span>
      </header>

      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <div className="flex items-start gap-2">
          <ShieldAlert className="mt-0.5 size-4 shrink-0" />
          <p>
            Restricted government feeds remain unavailable until an authorized endpoint and credential are supplied.
            Catalogue discovery is not satellite analysis, and prepared demo evidence is never presented as live.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="h-48 place-content-center text-center font-mono text-xs text-slate-500">Loading source catalogue…</div>
      ) : sources.length === 0 ? (
        <div className="surface-card p-8 text-center">
          <Radio className="mx-auto size-6 text-slate-400" />
          <h2 className="mt-3 font-semibold text-slate-900">Source catalogue unavailable</h2>
          <p className="mt-1 text-sm text-slate-500">Start the FastAPI backend and database to view configured providers.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {sources.map((source) => (
            <article key={source.slug} className="surface-card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-700">{source.category.replaceAll('_', ' ')}</p>
                  <h2 className="mt-1 font-bold text-slate-950">{source.name}</h2>
                  <p className="text-xs text-slate-500">{source.provider}</p>
                </div>
                <span className={`rounded border px-2 py-1 text-[10px] font-semibold ${statusClasses(source.status)}`}>
                  {source.status.replaceAll('_', ' ')}
                </span>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div><dt className="text-slate-500">Classification</dt><dd className="mt-0.5 font-medium text-slate-800">{provenanceLabels[source.provenance] ?? source.provenance}</dd></div>
                <div><dt className="text-slate-500">Access</dt><dd className="mt-0.5 font-medium text-slate-800">{source.access_type.replaceAll('_', ' ')}</dd></div>
                <div><dt className="text-slate-500">Last success</dt><dd className="mt-0.5 font-medium text-slate-800">{source.last_success_at ? new Date(source.last_success_at).toLocaleString() : 'No ingestion recorded'}</dd></div>
                <div><dt className="text-slate-500">Licence</dt><dd className="mt-0.5 font-medium text-slate-800">{source.license_name ?? 'See provider terms'}</dd></div>
              </dl>

              {source.attribution && <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">{source.attribution}</p>}
              {source.last_error && <p className="mt-3 rounded bg-red-50 p-2 text-xs text-red-700">{source.last_error}</p>}
              {source.credential_env && (
                <p className="mt-3 inline-flex items-center gap-1 font-mono text-[10px] text-slate-500">
                  <ExternalLink className="size-3" /> Server credential: {source.credential_env}
                </p>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
