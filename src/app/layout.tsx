import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Quillay ERP',
  description: 'Sistema integral de gestión Quillay SPA',
  icons: { icon: '/logo/quillay-icon.png' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
