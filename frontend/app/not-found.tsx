'use client';

import Link from 'next/link';
import { ArrowLeft, SearchX } from 'lucide-react';

export default function NotFound() {
  return <div className="mx-auto flex min-h-[calc(100dvh-4rem)] max-w-2xl items-center px-5 py-12 lg:min-h-dvh"><div className="w-full rounded-2xl border border-[var(--color-border)] bg-white p-8 sm:p-12"><SearchX size={36} className="text-[var(--color-primary)]" aria-hidden="true" /><p className="mt-6 text-sm font-semibold text-[var(--color-primary)]">Halaman 404</p><h1 className="mt-2 text-3xl font-semibold">Halaman tidak ditemukan</h1><p className="mt-3 text-[var(--color-text-secondary)]">Periksa alamat halaman atau kembali ke ringkasan inventaris.</p><div className="mt-7 flex flex-wrap gap-3"><Link href="/" className="btn-primary inline-flex items-center">Buka ringkasan</Link><button type="button" onClick={() => history.back()} className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-[var(--color-border-light)] px-5 font-semibold"><ArrowLeft size={17} aria-hidden="true" />Kembali</button></div></div></div>;
}
