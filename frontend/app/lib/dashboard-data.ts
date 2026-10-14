import type { BarangItem, LogPrediksiItem } from './api';

export type DashboardRow = BarangItem & { log?: LogPrediksiItem };
export type CategoryCount = { name: string; count: number };

export interface DashboardSummary {
  total: number;
  predicted: number;
  risk: number;
  belowMinimum: number;
  healthyStock: number;
  safe: number;
  unpredicted: number;
  rows: DashboardRow[];
  priority: DashboardRow[];
  categories: CategoryCount[];
  riskByCategory: CategoryCount[];
}

function stockBelowMinimum(item: BarangItem): boolean {
  const stock = Number(item.stok_saat_ini);
  const minimum = Number(item.min_bank);
  return Number.isFinite(stock) && Number.isFinite(minimum) && stock < minimum;
}

export function summarizeInventory(barang: BarangItem[], logs: LogPrediksiItem[]): DashboardSummary {
  const logBySku = new Map(logs.map(log => [log.sku, log]));
  const rows = barang.map(item => ({ ...item, log: logBySku.get(item.sku) }));
  const categories = new Map<string, number>();
  const riskByCategory = new Map<string, number>();
  let predicted = 0;
  let risk = 0;
  let belowMinimum = 0;

  for (const item of rows) {
    const category = item.kategori_barang || 'Tanpa kategori';
    categories.set(category, (categories.get(category) ?? 0) + 1);
    if (item.log) predicted++;
    if (item.log?.is_backorder) {
      risk++;
      riskByCategory.set(category, (riskByCategory.get(category) ?? 0) + 1);
    }
    if (stockBelowMinimum(item)) belowMinimum++;
  }

  const sortedCounts = (map: Map<string, number>) => [...map].map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'id'));

  const priority = rows.filter(item => item.log?.is_backorder || stockBelowMinimum(item))
    .sort((a, b) => Number(Boolean(b.log?.is_backorder)) - Number(Boolean(a.log?.is_backorder))
      || Number(b.log?.probabilitas_backorder ?? 0) - Number(a.log?.probabilitas_backorder ?? 0)
      || Number(stockBelowMinimum(b)) - Number(stockBelowMinimum(a)));

  return {
    total: rows.length,
    predicted,
    risk,
    belowMinimum,
    healthyStock: rows.length - belowMinimum,
    safe: predicted - risk,
    unpredicted: rows.length - predicted,
    rows,
    priority,
    categories: sortedCounts(categories),
    riskByCategory: sortedCounts(riskByCategory),
  };
}
