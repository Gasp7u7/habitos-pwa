import type {Metadata} from 'next';
import './globals.css';
import MobileLayout from '@/components/layout/MobileLayout'; // Add layout import

export const metadata: Metadata = {
  title: 'My Google AI Studio App',
  description: 'MVP de bienestar personal',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <MobileLayout>
          {children}
        </MobileLayout>
      </body>
    </html>
  );
}
