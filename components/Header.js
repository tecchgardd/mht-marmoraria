'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import LogoMHT from '@/components/LogoMHT';

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Materiais', href: '#materiais' },
  { label: 'Projetos', href: '#projetos' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Contato', href: '#contato' },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#050505]/92 backdrop-blur-md">
      <div className="container-px flex h-20 items-center justify-between">
        <a href="#inicio" aria-label="Marmoraria MHT" className="transition hover:opacity-90">
          <LogoMHT />
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-display text-sm uppercase tracking-wide text-stone-150 transition-colors hover:text-gold-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="https://wa.me/5511999999999"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden items-center gap-2 rounded-sm border border-gold-400/70 px-6 py-3 font-display text-sm uppercase tracking-wide text-gold-200 transition hover:bg-gold-400 hover:text-ink-950 lg:inline-flex"
        >
          <WhatsAppIcon size={16} className="shrink-0" />
          Chamar no WhatsApp
        </a>

        <button
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          className="text-stone-150 lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-white/5 bg-[#050505] px-6 pb-6 pt-3 lg:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-display text-sm uppercase tracking-wide text-stone-250 hover:text-gold-300"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://wa.me/5511999999999"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-gold mt-2"
          >
            <WhatsAppIcon size={16} className="shrink-0" />
            Chamar no WhatsApp
          </a>
        </div>
      )}
    </header>
  );
}
