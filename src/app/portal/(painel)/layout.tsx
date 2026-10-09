import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import PortalShell from '@/components/portal/PortalShell';
import { getCurrentUser } from '@/lib/auth/session';
import { missingPortalConfig } from '@/lib/portal/config';
import { SIDEBAR_COOKIE } from '@/lib/portal/constants';

export default async function PortalPanelLayout({ children }: { children: ReactNode }) {
  const user = missingPortalConfig().length === 0 ? await getCurrentUser() : null;
  if (!user) redirect('/portal/login');

  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === 'collapsed';

  return (
    <PortalShell email={user.email} initialCollapsed={collapsed}>
      {children}
    </PortalShell>
  );
}
