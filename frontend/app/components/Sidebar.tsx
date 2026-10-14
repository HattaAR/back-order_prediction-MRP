'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { Boxes, ChartNoAxesCombined, Files, LayoutDashboard, Menu, PackageSearch, ScanSearch, X } from 'lucide-react';

const items = [
  { href: '/', label: 'Ringkasan', icon: LayoutDashboard },
  { href: '/inventory', label: 'Inventaris', icon: PackageSearch },
  { href: '/predict', label: 'Prediksi item', icon: ScanSearch },
  { href: '/batch', label: 'Prediksi batch', icon: Files },
  { href: '/analysis', label: 'Analisis model', icon: ChartNoAxesCombined },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    navRef.current?.querySelector<HTMLAnchorElement>('a')?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <div className="fixed inset-x-0 top-0 z-40 flex h-14 items-center justify-between border-b border-[var(--color-border)] bg-white px-4 lg:hidden">
        <Link href="/" className="flex items-center gap-2 text-sm font-semibold text-[var(--color-text-primary)]">
          <span className="grid size-8 place-items-center rounded-lg bg-[var(--color-primary)] text-white"><Boxes size={17} aria-hidden="true" /></span>
          Backorder Desk
        </Link>
        <button ref={toggleRef} type="button" className="grid size-11 place-items-center rounded-lg border border-[var(--color-border)]" aria-label={open ? 'Tutup navigasi' : 'Buka navigasi'} aria-expanded={open} aria-controls="primary-navigation" onClick={() => setOpen(value => !value)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      {open && <button type="button" className="fixed inset-0 z-40 bg-[#172a33]/45 lg:hidden" aria-label="Tutup navigasi" onClick={() => setOpen(false)} />}
      <aside id="primary-navigation" aria-label="Navigasi utama" className={`fixed inset-y-0 left-0 z-50 flex w-[224px] flex-col border-r border-[var(--color-border)] bg-white transition-transform lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 lg:visible ${open ? 'translate-x-0 visible' : '-translate-x-full invisible'}`}>
        <div className="border-b border-[var(--color-border)] px-4 py-5">
          <Link href="/" onClick={() => setOpen(false)} className="flex items-center gap-2.5 text-[var(--color-text-primary)]">
            <span className="grid size-9 place-items-center rounded-lg bg-[var(--color-primary)] text-white"><Boxes size={19} aria-hidden="true" /></span>
            <span><strong className="block text-sm leading-tight">Backorder Desk</strong><span className="text-xs text-[var(--color-text-muted)]">Inventory control</span></span>
          </Link>
        </div>
        <nav ref={navRef} className="flex-1 space-y-1 px-2 py-5" aria-label="Halaman">
          {items.map(item => {
            const active = pathname === item.href;
            return <Link key={item.href} href={item.href} aria-current={active ? 'page' : undefined} onClick={() => setOpen(false)} className={`flex min-h-11 items-center gap-3 rounded-lg border-l-[3px] px-3 text-sm font-medium transition-colors ${active ? 'border-[var(--color-primary)] bg-[#eaf3f0] text-[var(--color-primary-dark)]' : 'border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]'}`}><item.icon size={18} aria-hidden="true" />{item.label}</Link>;
          })}
        </nav>
        <p className="border-t border-[var(--color-border)] px-5 py-4 text-xs text-[var(--color-text-muted)]">Pantau stok. Tindak risiko.</p>
      </aside>
    </>
  );
}
