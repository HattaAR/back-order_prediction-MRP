'use client';

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { CategoryCount } from '../lib/dashboard-data';

interface Props {
  categories: CategoryCount[];
  riskByCategory: CategoryCount[];
  healthyStock: number;
  belowMinimum: number;
  safe: number;
  risk: number;
  unpredicted: number;
  inventoryAvailable: boolean;
  predictionsAvailable: boolean;
}

function CountTable({ data, label }: { data: CategoryCount[]; label: string }) {
  return <details className="mt-2 border-t border-[var(--color-border)] pt-2 text-sm"><summary className="cursor-pointer font-semibold text-[var(--color-primary)]">Lihat data {label}</summary><table className="mt-2 w-full text-left"><thead><tr><th scope="col" className="py-1.5">Kategori</th><th scope="col" className="py-1.5 text-right">SKU</th></tr></thead><tbody>{data.map(item => <tr key={item.name} className="border-t border-[var(--color-border)]"><td className="py-1.5">{item.name}</td><td className="py-1.5 text-right tabular-nums">{item.count}</td></tr>)}</tbody></table></details>;
}

function CategoryChart({ title, data, color, empty }: { title: string; data: CategoryCount[]; color: string; empty: string }) {
  return <section className="dashboard-panel min-w-0" aria-label={title}><h3 className="text-base font-semibold">{title}</h3>{data.length === 0 ? <p className="dashboard-empty">{empty}</p> : <><div className="mt-3 h-[176px] w-full" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><BarChart data={data.slice(0, 5)} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }}><CartesianGrid stroke="#e6eeeb" horizontal={false} /><XAxis type="number" allowDecimals={false} tick={{ fill: '#586e75', fontSize: 11 }} /><YAxis type="category" dataKey="name" width={92} tick={{ fill: '#48616a', fontSize: 11 }} tickFormatter={value => String(value).length > 13 ? `${String(value).slice(0, 12)}…` : value} /><Tooltip formatter={value => [`${value} SKU`, 'Jumlah']} /><Bar dataKey="count" fill={color} radius={[0, 3, 3, 0]} isAnimationActive={false} /></BarChart></ResponsiveContainer></div><CountTable data={data} label={title.toLowerCase()} /></>}</section>;
}

export default function DashboardAnalytics({ categories, riskByCategory, healthyStock, belowMinimum, safe, risk, unpredicted, inventoryAvailable, predictionsAvailable }: Props) {
  const predicted = safe + risk;
  const totalStockItems = healthyStock + belowMinimum;
  const outcome = [{ name: 'Berisiko', value: risk, color: '#b05b3a' }, { name: 'Aman', value: safe, color: '#1f7164' }];

  return <section aria-labelledby="analytics-heading"><div className="mb-3"><h2 id="analytics-heading" className="text-lg font-semibold">Gambaran inventaris</h2><p className="text-sm text-[var(--color-text-secondary)]">Distribusi saat ini berdasarkan barang dan log prediksi.</p></div><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
    {inventoryAvailable ? <CategoryChart title="SKU per kategori" data={categories} color="#315b66" empty="Belum ada SKU untuk ditampilkan." /> : <section className="dashboard-panel"><h3 className="text-base font-semibold">SKU per kategori</h3><p className="dashboard-empty">Data inventaris belum tersedia.</p></section>}
    <section className="dashboard-panel" aria-labelledby="outcome-heading"><h3 id="outcome-heading" className="text-base font-semibold">Hasil prediksi</h3>{!predictionsAvailable ? <p className="dashboard-empty">Log prediksi belum tersedia.</p> : predicted === 0 ? <p className="dashboard-empty">Belum ada SKU yang diprediksi.</p> : <><div className="relative mx-auto mt-1 h-[158px] max-w-[250px]" aria-hidden="true"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={outcome} dataKey="value" nameKey="name" innerRadius={47} outerRadius={66} stroke="none" isAnimationActive={false}>{outcome.map(item => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip formatter={value => [`${value} SKU`, 'Jumlah']} /></PieChart></ResponsiveContainer><div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"><strong className="text-2xl tabular-nums">{predicted}</strong><span className="text-xs text-[var(--color-text-muted)]">diprediksi</span></div></div><div className="mt-1 flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs"><span><i className="mr-1 inline-block size-2 rounded-full bg-[#b05b3a]" />Berisiko {risk}</span><span><i className="mr-1 inline-block size-2 rounded-full bg-[#1f7164]" />Aman {safe}</span></div><p className="mt-2 text-center text-xs text-[var(--color-text-muted)]">{unpredicted} SKU belum diprediksi</p></>}</section>
    {predictionsAvailable ? <CategoryChart title="Risiko per kategori" data={riskByCategory} color="#b05b3a" empty="Belum ada SKU berisiko." /> : <section className="dashboard-panel"><h3 className="text-base font-semibold">Risiko per kategori</h3><p className="dashboard-empty">Log prediksi belum tersedia.</p></section>}
    <section className="dashboard-panel" aria-labelledby="stock-heading"><h3 id="stock-heading" className="text-base font-semibold">Kesehatan stok</h3>{!inventoryAvailable ? <p className="dashboard-empty">Data inventaris belum tersedia.</p> : totalStockItems === 0 ? <p className="dashboard-empty">Belum ada SKU untuk dinilai.</p> : <><p className="mt-4 text-sm text-[var(--color-text-secondary)]">Dibandingkan dengan batas minimum setiap SKU</p><div className="mt-4 flex h-3 overflow-hidden rounded-full bg-[var(--color-bg-elevated)]" aria-hidden="true"><span className="bg-[var(--color-primary)]" style={{ width: `${healthyStock / totalStockItems * 100}%` }} /><span className="bg-[#b05b3a]" style={{ width: `${belowMinimum / totalStockItems * 100}%` }} /></div><dl className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><dt>Stok memenuhi minimum</dt><dd className="font-semibold tabular-nums">{healthyStock} SKU</dd></div><div className="flex justify-between"><dt>Di bawah minimum</dt><dd className="font-semibold tabular-nums text-[#934b30]">{belowMinimum} SKU</dd></div></dl>{predictionsAvailable && <p className="mt-5 border-t border-[var(--color-border)] pt-3 text-xs text-[var(--color-text-secondary)]">{risk} SKU juga memiliki prediksi backorder. Kelompok ini dapat tumpang tindih dengan stok rendah.</p>}</>}</section>
  </div></section>;
}
