'use client';

import { useState } from 'react';
import {
  FlaskConical,
  Send,
  Loader2,
  RotateCcw,
} from 'lucide-react';
import {
  predictSingle,
  FEATURE_GROUPS,
  type PredictionInput,
  type PredictionResult,
} from '../lib/api';
import RiskGauge from '../components/RiskGauge';

// Default values dari FEATURE_GROUPS
function buildDefaults(): PredictionInput {
  const defaults: Record<string, number> = {};
  for (const group of FEATURE_GROUPS) {
    for (const f of group.fields) {
      defaults[f.key] = f.default;
    }
  }
  return defaults as unknown as PredictionInput;
}

export default function PredictPage() {
  const [form, setForm]       = useState<PredictionInput>(buildDefaults());
  const [result, setResult]   = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const updateField = (key: string, value: number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const errors: Record<string, string> = {};
    for (const group of FEATURE_GROUPS) for (const field of group.fields) {
      if ('type' in field) continue;
      const value = form[field.key as keyof PredictionInput];
      if (!Number.isFinite(value) || value < field.min || value > field.max) errors[field.key] = `${field.label} harus antara ${field.min} dan ${field.max}.`;
    }
    setFieldErrors(errors);
    if (Object.keys(errors).length) { document.getElementById(`field-${Object.keys(errors)[0]}`)?.focus(); return; }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await predictSingle(form);
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menjalankan prediksi.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setForm(buildDefaults());
    setResult(null);
    setError(null);
    setFieldErrors({});
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-10 pt-5 sm:px-6 lg:px-7">
      {/* Header */}
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)]">
          Prediksi Backorder
        </h1>
        <p className="text-[var(--color-text-secondary)] mt-2 text-sm">
          Masukkan 21 parameter fitur untuk memprediksi risiko backorder suatu item.
        </p>
      </div>

      {/* Result card — tampil di atas jika ada hasil */}
      {result && (
        <div
          className={`glass-card p-6 mb-6 animate-fade-in-up border ${
            result.is_backorder
              ? 'border-red-500/30 bg-red-500/5'
              : 'border-emerald-500/30 bg-emerald-500/5'
          }`}
        >
          <div className="flex flex-col sm:flex-row items-start gap-6">
            {/* RiskGauge visual */}
            <div className="flex-shrink-0 mx-auto sm:mx-0">
              <RiskGauge
                probability={result.probability}
                threshold={result.threshold_used}
                status={result.status}
                size={200}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-[var(--color-text-primary)]">
                {result.is_backorder ? '⚠ Risiko Backorder Terdeteksi' : '✓ Item Diprediksi Aman'}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] mt-1">
                {result.is_backorder
                  ? 'Model mendeteksi potensi backorder. Pertimbangkan untuk menambah stok atau mempercepat pengadaan.'
                  : 'Model tidak mendeteksi risiko backorder saat ini. Tetap lakukan monitoring rutin.'}
              </p>
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)]">
                  <p className="text-xs text-[var(--color-text-muted)]">Probabilitas</p>
                  <p className={`text-xl font-bold font-mono ${
                    result.is_backorder ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {(result.probability * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)]">
                  <p className="text-xs text-[var(--color-text-muted)]">Status</p>
                  <p className={`text-xl font-bold ${
                    result.is_backorder ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {result.status}
                  </p>
                </div>
                <div className="px-4 py-2 rounded-lg bg-[var(--color-bg-elevated)]">
                  <p className="text-xs text-[var(--color-text-muted)]">Threshold</p>
                  <p className="text-xl font-bold text-[var(--color-primary-light)] font-mono">
                    {(result.threshold_used * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
              {/* Probability bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1">
                  <span>0%</span>
                  <span>Threshold {(result.threshold_used * 100).toFixed(0)}%</span>
                  <span>100%</span>
                </div>
                <div className="relative w-full h-3 rounded-full bg-[var(--color-border)] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(result.probability * 100, 100)}%`,
                      background: result.is_backorder
                        ? 'linear-gradient(90deg, #f59e0b, #ef4444)'
                        : 'linear-gradient(90deg, #10b981, #06b6d4)',
                    }}
                  />
                  {/* Threshold marker */}
                  <div
                    className="absolute top-0 h-full w-0.5 bg-white/50"
                    style={{ left: `${result.threshold_used * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div role="alert" className="glass-card p-4 mb-6 border border-red-500/20 bg-red-500/5 animate-fade-in-up">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Form groups */}
      <div className="space-y-6">
        {FEATURE_GROUPS.map((group, gi) => (
          <div
            key={group.title}
            className="glass-card p-6 animate-fade-in-up"
            style={{ animationDelay: `${gi * 0.05}s` }}
          >
            <h2 className="text-base font-semibold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
              <FlaskConical size={18} className="text-[var(--color-primary-light)]" />
              {group.title}
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.fields.map(field => {
                const value = form[field.key as keyof PredictionInput];

                // Toggle field (0/1)
                if ('type' in field && field.type === 'toggle') {
                  return (
                    <div key={field.key} className="p-3 rounded-xl bg-[var(--color-bg-elevated)]">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mr-3">
                          <span className="text-sm font-medium text-[var(--color-text-primary)] block">{field.label}</span>
                          <p id={`desc-${field.key}`} className="text-xs text-[var(--color-text-muted)] mt-0.5">{field.desc}</p>
                        </div>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={value === 1}
                          aria-label={field.label}
                          aria-describedby={`desc-${field.key}`}
                          onClick={() => updateField(field.key, value === 1 ? 0 : 1)}
                          className="relative w-12 h-11 flex-shrink-0"
                        >
                          <span aria-hidden="true" className={`absolute inset-x-0 top-[10px] h-6 rounded-full ${value === 1 ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-border-light)]'}`} />
                          <div
                            aria-hidden="true"
                            className={`absolute top-[12px] w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                              value === 1 ? 'translate-x-[26px]' : 'translate-x-[2px]'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  );
                }

                // Numeric field
                const numField = field as { key: string; label: string; desc: string; min: number; max: number; step: number; default: number };
                return (
                  <div key={field.key} className="p-3 rounded-xl bg-[var(--color-bg-elevated)]">
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor={`field-${numField.key}`} className="text-sm font-medium text-[var(--color-text-primary)]">{numField.label}</label>
                    </div>
                    <input
                      id={`field-${numField.key}`}
                      type="number"
                      className="input-field text-sm font-mono"
                      aria-invalid={Boolean(fieldErrors[numField.key])}
                      aria-describedby={`help-${numField.key}${fieldErrors[numField.key] ? ` error-${numField.key}` : ''}`}
                      value={value}
                      min={numField.min}
                      max={numField.max}
                      step={numField.step}
                      onChange={e => updateField(field.key, e.target.value === '' ? numField.min - 1 : Number(e.target.value))}
                    />
                    <p id={`help-${numField.key}`} className="mt-1 text-xs text-[var(--color-text-secondary)]">{numField.desc}</p>
                    {fieldErrors[numField.key] && <p id={`error-${numField.key}`} role="alert" className="mt-1 text-sm text-[#934b30]">{fieldErrors[numField.key]}</p>}
                    {/* Range info */}
                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1 font-mono">
                      Range: {numField.min} — {numField.max.toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="flex gap-3 mt-6 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-light)] transition-all text-sm font-medium disabled:opacity-60"
        >
          {loading
            ? <><Loader2 size={16} className="animate-spin" /> Memproses...</>
            : <><Send size={16} /> Jalankan Prediksi</>}
        </button>
        <button
          onClick={handleReset}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text-primary)] transition-all text-sm"
        >
          <RotateCcw size={15} />
          Reset
        </button>
      </div>
    </div>
  );
}
