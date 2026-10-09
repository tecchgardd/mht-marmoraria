import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Portal | MHT Marmoraria',
  robots: { index: false, follow: false },
};

export default function PortalRootLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-[#050505] text-stone-150">{children}</div>;
}
