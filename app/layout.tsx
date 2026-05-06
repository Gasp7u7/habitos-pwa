import type {Metadata, Viewport} from 'next';
import './globals.css';
import 'framework7/css/bundle';
import 'framework7-icons/css/framework7-icons.css';

export const metadata: Metadata = {
  title: 'Hábitos PWA',
  description: 'Tu compañero de gym, caminatas y escaladas',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#D4F87A',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning className="antialiased font-['Outfit',_sans-serif] bg-[#f8f9fa] text-gray-900">
        {children}
      </body>
    </html>
  );
}
