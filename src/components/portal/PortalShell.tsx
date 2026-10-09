'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Building2,
  ChevronLeft,
  Clapperboard,
  ExternalLink,
  Gem,
  Inbox,
  LayoutDashboard,
  LogOut,
  Menu,
  Trophy,
  Users,
  Wrench,
  X,
  type LucideIcon,
} from 'lucide-react';
import { SIDEBAR_COOKIE } from '@/lib/portal/constants';

const ROW_HEIGHT = 44;

const NAV: Array<{ href: string; label: string; icon: LucideIcon }> = [
  { href: '/portal', label: 'Visão geral', icon: LayoutDashboard },
  { href: '/portal/orcamentos', label: 'Orçamentos', icon: Inbox },
  { href: '/portal/servicos', label: 'Serviços', icon: Wrench },
  { href: '/portal/materiais', label: 'Materiais', icon: Gem },
  { href: '/portal/cases', label: 'Cases de sucesso', icon: Trophy },
  { href: '/portal/banner', label: 'Banner da home', icon: Clapperboard },
  { href: '/portal/empresa', label: 'Perfil da empresa', icon: Building2 },
  { href: '/portal/usuarios', label: 'Usuários', icon: Users },
];

function activeIndex(pathname: string) {
  return NAV.findIndex(({ href }) => (href === '/portal' ? pathname === href : pathname.startsWith(href)));
}

// Label hidden (but still read by screen readers) when the sidebar is collapsed.
function Label({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  return (
    <span className={`truncate whitespace-nowrap transition-opacity duration-200 ${collapsed ? 'sr-only' : 'opacity-100'}`}>
      {children}
    </span>
  );
}

function Tooltip({ show, children }: { show: boolean; children: ReactNode }) {
  if (!show) return null;
  return (
    <span className="pointer-events-none absolute left-full top-1/2 z-50 ml-4 -translate-y-1/2 translate-x-1 whitespace-nowrap rounded-md border border-white/10 bg-[#1a1814] px-2.5 py-1.5 text-xs text-stone-150 opacity-0 shadow-lg transition duration-150 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
      {children}
    </span>
  );
}

function SidebarContent({
  email,
  collapsed,
  onToggle,
  onNavigate,
}: {
  email: string;
  collapsed: boolean;
  onToggle?: () => void;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const current = activeIndex(pathname);

  async function logout() {
    await fetch('/api/portal/auth/logout', { method: 'POST' });
    router.replace('/portal/login');
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col py-5">
      {/* Marca */}
      <div className={`flex h-14 items-center ${collapsed ? 'justify-center px-2' : 'px-6'}`}>
        <Link href="/portal" onClick={onNavigate} aria-label="MHT Marmoraria - visão geral">
          {collapsed ? (
            <Image src="/assets/logo/mht-monograma.webp" alt="" width={320} height={123} className="h-auto w-9" priority />
          ) : (
            <Image src="/assets/logo/mht-logo-creme-ouro.webp" alt="" width={1200} height={670} className="h-auto w-28" priority />
          )}
        </Link>
      </div>

      {onToggle && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
          aria-expanded={!collapsed}
          className="absolute -right-3.5 top-9 z-10 hidden h-7 w-7 items-center justify-center rounded-full border border-white/15 bg-[#1a1814] text-stone-250 shadow-md transition hover:border-gold-400/60 hover:text-gold-300 lg:flex"
        >
          <ChevronLeft size={15} className={`transition-transform duration-300 ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      )}

      <div className="mx-5 my-4 h-px bg-white/[0.07]" />

      {/* Perfil */}
      <div className={`group relative mb-5 flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-5'}`}>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold-400/60 bg-gradient-to-br from-gold-400/25 to-transparent font-display text-sm uppercase text-gold-200 shadow-[0_6px_16px_rgba(0,0,0,0.4)]">
          {email.charAt(0)}
        </span>
        <Label collapsed={collapsed}>
          <span className="block truncate text-sm text-stone-150">{email}</span>
          <span className="block text-xs text-stone-250">Equipe MHT</span>
        </Label>
        <Tooltip show={collapsed}>{email}</Tooltip>
      </div>

      {/* Navegação com indicador deslizante */}
      <nav aria-label="Portal" className="relative">
        <span
          aria-hidden="true"
          className={`absolute inset-x-0 top-0 transition-[transform,opacity] duration-[380ms] ease-[cubic-bezier(0.34,1.16,0.42,1)] ${current < 0 ? 'opacity-0' : 'opacity-100'}`}
          style={{ height: ROW_HEIGHT, transform: `translateY(${Math.max(current, 0) * ROW_HEIGHT}px)` }}
        >
          <span className="absolute inset-y-0 left-0 right-0 bg-gradient-to-r from-gold-400/[0.14] to-gold-400/[0.03]" />
          <span className="absolute right-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-l-full bg-gold-400 shadow-[0_0_12px_rgba(205,161,79,0.6)]" />
        </span>

        <ul>
          {NAV.map(({ href, label, icon: Icon }, index) => {
            const active = index === current;
            return (
              <li key={href}>
                <Link
                  href={href}
                  onClick={onNavigate}
                  aria-current={active ? 'page' : undefined}
                  className={`group relative flex items-center gap-4 text-sm transition-colors duration-200 focus-visible:outline-none ${
                    collapsed ? 'justify-center px-2' : 'px-6'
                  } ${active ? 'text-gold-200' : 'text-stone-250 hover:text-stone-150'}`}
                  style={{ height: ROW_HEIGHT }}
                >
                  <Icon size={19} strokeWidth={1.8} className="shrink-0" />
                  <Label collapsed={collapsed}>{label}</Label>
                  <Tooltip show={collapsed}>{label}</Tooltip>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Rodapé (no celular fica no fim da gaveta) */}
      <div className="mx-5 mb-3 mt-5 h-px bg-white/[0.07] max-lg:mt-auto" />
      {[
        { label: 'Ver site', icon: ExternalLink, href: '/' },
        { label: 'Sair', icon: LogOut, onClick: logout },
      ].map(({ label, icon: Icon, href, onClick }) => {
        const className = `group relative flex w-full items-center gap-4 text-sm text-stone-250 transition hover:text-stone-150 focus-visible:outline-none focus-visible:text-gold-200 ${
          collapsed ? 'justify-center px-2' : 'px-6'
        }`;
        const content = (
          <>
            <Icon size={18} strokeWidth={1.8} className="shrink-0" />
            <Label collapsed={collapsed}>{label}</Label>
            <Tooltip show={collapsed}>{label}</Tooltip>
          </>
        );
        return href ? (
          <Link key={label} href={href} target="_blank" className={className} style={{ height: 40 }}>
            {content}
          </Link>
        ) : (
          <button key={label} type="button" onClick={onClick} className={className} style={{ height: 40 }}>
            {content}
          </button>
        );
      })}
    </div>
  );
}

export default function PortalShell({
  email,
  initialCollapsed,
  children,
}: {
  email: string;
  initialCollapsed: boolean;
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(initialCollapsed);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMobileOpen(false), [pathname]);

  function toggle() {
    setCollapsed((current) => {
      const next = !current;
      document.cookie = `${SIDEBAR_COOKIE}=${next ? 'collapsed' : 'expanded'}; path=/portal; max-age=31536000; samesite=lax`;
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(205,161,79,0.07),transparent_40%),#050505]">
      {/* Desktop */}
      <aside
        className={`fixed left-4 top-1/2 z-40 hidden max-h-[calc(100vh-32px)] -translate-y-1/2 rounded-3xl border border-white/[0.08] bg-[#0d0c0a]/95 shadow-[0_24px_60px_rgba(0,0,0,0.5)] backdrop-blur transition-[width] duration-[350ms] ease-out lg:block ${
          collapsed ? 'w-20' : 'w-[272px]'
        }`}
      >
        <SidebarContent email={email} collapsed={collapsed} onToggle={toggle} />
      </aside>

      {/* Mobile: barra superior + gaveta */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.08] bg-[#050505]/90 px-4 backdrop-blur lg:hidden">
        <Image src="/assets/logo/mht-monograma.webp" alt="MHT Marmoraria" width={320} height={123} className="h-auto w-14" priority />
        <button type="button" onClick={() => setMobileOpen(true)} aria-label="Abrir menu" className="rounded-lg p-2 text-stone-150 transition hover:bg-white/5">
          <Menu size={22} />
        </button>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="portal-overlay absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setMobileOpen(false)} aria-hidden="true" />
          <aside className="portal-drawer absolute bottom-3 left-3 top-3 w-[min(288px,calc(100vw-24px))] rounded-3xl border border-white/[0.08] bg-[#0d0c0a]">
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Fechar menu" className="absolute right-3 top-3 z-10 rounded-full p-2 text-stone-250 transition hover:bg-white/5 hover:text-stone-150">
              <X size={18} />
            </button>
            <SidebarContent email={email} collapsed={false} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <main className={`px-4 py-8 transition-[padding] duration-[350ms] ease-out sm:px-6 lg:py-10 lg:pr-10 ${collapsed ? 'lg:pl-[128px]' : 'lg:pl-[320px]'}`}>
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
