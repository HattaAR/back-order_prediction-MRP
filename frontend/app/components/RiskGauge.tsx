interface RiskGaugeProps { probability: number; threshold: number; status: string; size?: number }

export default function RiskGauge({ probability, threshold, status }: RiskGaugeProps) {
  const percent = Math.max(0, Math.min(100, probability * 100));
  const thresholdPercent = Math.max(0, Math.min(100, threshold * 100));
  const risky = status === 'Backorder';
  return <div className="w-full min-w-[200px] rounded-xl bg-[var(--color-bg-elevated)] p-5 text-center"><p className="text-sm font-semibold text-[var(--color-text-secondary)]">Probabilitas backorder</p><p className={`mt-2 text-4xl font-semibold tabular-nums ${risky ? 'text-[#934b30]' : 'text-[var(--color-primary)]'}`}>{percent.toFixed(1)}%</p><p className={`mt-2 inline-block rounded-full px-3 py-1 text-sm font-semibold ${risky ? 'bg-[#fbede6] text-[#934b30]' : 'bg-[#e4f3ec] text-[#176653]'}`}>{risky ? 'Berisiko backorder' : 'Diprediksi aman'}</p><div className="mt-5 h-3 overflow-hidden rounded-full bg-[#d7e1df]" role="meter" aria-label="Probabilitas backorder" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent}><div className={`h-full rounded-full ${risky ? 'bg-[#b05b3a]' : 'bg-[var(--color-primary)]'}`} style={{ width: `${percent}%` }} /></div><p className="mt-2 text-xs text-[var(--color-text-secondary)]">Ambang keputusan {thresholdPercent.toFixed(0)}%</p></div>;
}
