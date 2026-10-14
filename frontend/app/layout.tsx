import type { Metadata } from 'next';
import { Lexend, Source_Sans_3 } from 'next/font/google';
import Sidebar from './components/Sidebar';
import './globals.css';

const heading = Lexend({ subsets: ['latin'], variable: '--font-heading', display: 'swap' });
const body = Source_Sans_3({ subsets: ['latin'], variable: '--font-body', display: 'swap' });

export const metadata: Metadata = {
  title: 'Inventory Control Desk | Backorder Prediction',
  description: 'Pantau inventaris dan risiko backorder berdasarkan data operasional.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id" className={`${heading.variable} ${body.variable}`}>
      <body className="min-h-dvh lg:flex">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:p-3">Lewati navigasi</a>
        <Sidebar />
        <main id="main-content" tabIndex={-1} className="min-w-0 flex-1 min-h-dvh pt-14 lg:pt-0">{children}</main>
      </body>
    </html>
  );
}
