import MobileLayout from '@/components/layout/MobileLayout';

export default function AppLayout({children}: {children: React.ReactNode}) {
  return (
    <MobileLayout>
      {children}
    </MobileLayout>
  );
}
