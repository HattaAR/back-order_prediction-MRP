'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { AlertTriangle, ArrowUpRight, Boxes, ClipboardCheck, PackageMinus, RefreshCw, Server } from 'lucide-react';
import { getBarang, getHealth, getPredictLog, type BarangItem, type LogPrediksiItem } from './lib/api';
import { summarizeInventory } from './lib/dashboard-data';

const DashboardAnalytics = dynamic(() => import('./components/DashboardAnalytics'), {
  ssr: false,
  loading: () => <div className="dashboard-panel" role="status">Memuat visualisasi inventaris...</div>,
});

type Health = Record<string, string>;

function errorMessage(error: unknown, subject: string): string {
  const detail = error instanceof Error && !(error instanceof TypeError) ? ` ${error.message}` : '';
  return `${subject} belum tersedia.${detail} Periksa layanan API lalu coba lagi.`;
}

export default function DashboardPage() {
  const [barang, setBarang] = useState<BarangItem[] | null>(null);
  const [logs, setLogs] = useState<LogPrediksiItem[] | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [inventoryError, setInventoryError] = useState<string | null>(null);
  const [logError, setLogError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadedAt, setLoadedAt] = useState<Date | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('all');

  const load = useCallback(async () => {
    setLoading(true);
    const [inventoryResult, logResult, healthResult] = await Promise.allSettled([getBarang(), getPredictLog(), getHealth()]);
    setBarang(inventoryResult.status === 'fulfilled' ? inventoryResult.value : null);
    setLogs(logResult.status === 'fulfilled' ? logResult.value : null);
    setHealth(healthResult.status === 'fulfilled' ? healthResult.value : null);
    setInventoryError(inventoryResult.status === 'rejected' ? errorMessage(inventoryResult.reason, 'Data inventaris') : null);
    setLogError(logResult.status === 'rejected' ? errorMessage(logResult.reason, 'Log prediksi') : null);
    setHealthError(healthResult.status === 'rejected' ? errorMessage(healthResult.reason, 'Status layanan') : null);
    setLoadedAt(new Date());
    setLoading(false);
  }, []);

  useEffect(() => { void Promise.resolve().then(load); }, [load]);

  const summary = useMemo(() => summarizeInventory(barang ?? [], logs ?? []), [barang, logs]);
  const priority = summary.priority.filter(item => categoryFilter === 'all' || (item.kategori_barang || 'Tanpa kategori') === categoryFilter).slice(0, 8);
  const healthState = health ? Object.values(health).every(value => value === 'ok') ? 'Semua layanan aktif' : 'Sebagian layanan bermasalah' : 'Status layanan tidak tersedia';

  const kpis = [
    { label: 'Total SKU', value: barang ? summary.total : null, icon: Boxes, note: 'Dalam inventaris' },
    { label: 'Sudah diprediksi', value: barang && logs ? summary.predicted : null, icon: ClipboardCheck, note: 'Memiliki hasil model' },
    { label: 'Risiko backorder', value: barang && logs ? summary.risk : null, icon: AlertTriangle, note: 'Perlu perhatian', alert: true },
    { label: 'Stok di bawah minimum', value: barang ? summary.belowMinimum : null, icon: PackageMinus, note: 'Di bawah min_bank', alert: true },
  ];

  return (
    <div className="mx-auto max-w-[1560px] px-4 pb-10 pt-5 sm:px-6 lg:px-7">
      <header className="mb-5 flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] pb-4">
        <div>
          <h1 className="text-2xl font-semibold">Ringkasan inventaris</h1>
          <p className="mt-0.5 text-sm text-[var(--color-text-secondary)]">Barang mana yang membutuhkan perhatian sekarang?</p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {loadedAt && <span className="text-xs text-[var(--color-text-muted)]">Diperbarui {loadedAt.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>}
          <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[var(--color-border-light)] bg-white px-3 text-sm font-semibold disabled:opacity-50"><RefreshCw size={15} aria-hidden="true" />{loading ? 'Memuat...' : 'Perbarui data'}</button>
        </div>
      </header>

      {(inventoryError || logError) && <div role="alert" className="mb-4 rounded-lg border border-[#dfb5a3] bg-[#fbede6] px-4 py-3 text-sm text-[#79422e]"><strong className="block">Sebagian data belum dapat dimuat</strong>{inventoryError && <p>{inventoryError}</p>}{logError && <p>{logError}</p>}</div>}

      <section aria-label="KPI inventaris" className="mb-4 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {kpis.map(item => <div key={item.label} className="min-w-0 rounded-xl border border-[var(--color-border)] bg-white px-3 py-3.5 sm:px-4"><div className="flex items-start justify-between gap-1"><p className="min-w-0 text-xs font-semibold leading-4 text-[var(--color-text-secondary)] sm:text-sm">{item.label}</p><item.icon size={17} className={`shrink-0 ${item.alert ? 'text-[#b05b3a]' : 'text-[var(--color-primary)]'}`} aria-hidden="true" /></div><p className="mt-2 text-[28px] font-semibold leading-none tabular-nums sm:text-[32px]" aria-live="polite">{item.value === null ? '—' : item.value.toLocaleString('id-ID')}</p><p className="mt-2 hidden text-xs text-[var(--color-text-muted)] sm:block">{item.note}</p></div>)}
      </section>

      <section aria-labelledby="priority-heading" className="mb-5 overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3.5 sm:px-5">
          <div><h2 id="priority-heading" className="text-lg font-semibold">Prioritas perhatian</h2><p className="text-sm text-[var(--color-text-secondary)]">SKU berisiko backorder atau stok di bawah minimum.</p></div>
          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="priority-category" className="sr-only">Filter kategori prioritas</label>
            <select id="priority-category" value={categoryFilter} onChange={event => setCategoryFilter(event.target.value)} disabled={!barang || summary.categories.length === 0} className="min-h-10 max-w-44 rounded-lg border border-[var(--color-border-light)] bg-white px-2 text-sm disabled:opacity-50"><option value="all">Semua kategori</option>{summary.categories.map(item => <option key={item.name} value={item.name}>{item.name}</option>)}</select>
            <Link href="/inventory" className="inline-flex min-h-10 items-center gap-1 rounded-lg px-2 text-sm font-semibold text-[var(--color-primary)] hover:bg-[var(--color-bg-elevated)]">Inventaris <ArrowUpRight size={15} aria-hidden="true" /></Link>
          </div>
        </div>
        {loading && !barang ? <p role="status" className="px-5 py-9 text-sm text-[var(--color-text-secondary)]">Memuat daftar prioritas...</p> : !barang ? <p className="px-5 py-9 text-sm text-[var(--color-text-secondary)]">Daftar prioritas belum tersedia. Periksa layanan data lalu perbarui halaman.</p> : summary.total === 0 ? <p className="px-5 py-9 text-sm text-[var(--color-text-secondary)]">Belum ada SKU dalam inventaris. Data barang dari API masih kosong.</p> : priority.length === 0 ? <p className="px-5 py-9 text-sm text-[var(--color-text-secondary)]">{categoryFilter === 'all' ? 'Tidak ada SKU berisiko atau di bawah stok minimum saat ini.' : 'Tidak ada SKU prioritas pada kategori ini.'}</p> : <div className="overflow-x-auto"><table className="w-full min-w-[790px] text-left text-sm"><thead className="bg-[var(--color-bg-elevated)] text-xs text-[var(--color-text-secondary)]"><tr><th scope="col" className="px-4 py-2.5 font-semibold">SKU</th><th scope="col" className="px-3 py-2.5 font-semibold">Barang</th><th scope="col" className="px-3 py-2.5 text-right font-semibold">Stok</th><th scope="col" className="px-3 py-2.5 text-right font-semibold">Min. stok</th><th scope="col" className="px-3 py-2.5 text-right font-semibold">Probabilitas</th><th scope="col" className="px-3 py-2.5 font-semibold">Alasan</th><th scope="col" className="px-4 py-2.5 font-semibold">Tindakan</th></tr></thead><tbody>{priority.map(item => { const below = Number(item.stok_saat_ini) < Number(item.min_bank); return <tr key={item.sku} className="border-t border-[var(--color-border)]"><td className="px-4 py-3 font-semibold text-[var(--color-primary)]">{item.sku}</td><td className="px-3 py-3"><span className="block font-medium">{item.nama_barang}</span><span className="text-xs text-[var(--color-text-muted)]">{item.kategori_barang || 'Tanpa kategori'}</span></td><td className="px-3 py-3 text-right tabular-nums">{Number(item.stok_saat_ini).toLocaleString('id-ID')}</td><td className="px-3 py-3 text-right tabular-nums">{Number(item.min_bank).toLocaleString('id-ID')}</td><td className="px-3 py-3 text-right tabular-nums">{item.log ? `${Number(item.log.probabilitas_backorder).toFixed(1)}%` : '—'}</td><td className="px-3 py-3 text-xs font-medium text-[#934b30]">{[item.log?.is_backorder && 'Backorder', below && 'Stok rendah'].filter(Boolean).join(' · ')}</td><td className="px-4 py-3"><Link href="/inventory" className="inline-flex min-h-9 items-center text-xs font-semibold text-[var(--color-primary)] hover:underline" aria-label={`Buka inventaris untuk meninjau SKU ${item.sku}`}>Tinjau inventaris</Link></td></tr>; })}</tbody></table></div>}
      </section>

      <DashboardAnalytics categories={summary.categories} riskByCategory={summary.riskByCategory} healthyStock={summary.healthyStock} belowMinimum={summary.belowMinimum} safe={summary.safe} risk={summary.risk} unpredicted={summary.unpredicted} inventoryAvailable={barang !== null} predictionsAvailable={barang !== null && logs !== null} />

      <section aria-labelledby="service-heading" className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-[var(--color-border)] bg-white px-4 py-3 text-sm"><div className="flex items-center gap-2"><Server size={16} className="text-[var(--color-primary)]" aria-hidden="true" /><h2 id="service-heading" className="font-semibold">Status layanan</h2></div><span className="text-[var(--color-text-secondary)]">{healthState}</span>{[['backend', 'Express API'], ['database', 'MySQL'], ['model_service', 'Model Flask']].map(([key, label]) => <span key={key} className="inline-flex items-center gap-1.5"><span className={`size-2 rounded-full ${health?.[key] === 'ok' ? 'bg-[var(--color-primary)]' : health?.[key] ? 'bg-[#b05b3a]' : 'bg-[var(--color-border-light)]'}`} aria-hidden="true" />{label}: {health?.[key] === 'ok' ? 'Aktif' : health?.[key] ? 'Bermasalah' : 'Tidak diketahui'}</span>)}{healthError && <p role="alert" className="w-full text-[#934b30]">{healthError}</p>}</section>
    </div>
  );
}
