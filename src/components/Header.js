'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import Image from 'next/image';
import QuoteButton from '@/components/quote/QuoteButton';

const NAV_LINKS = [
  { label: 'Início', href: '#inicio' },
  { label: 'Sobre', href: '#sobre' },
  { label: 'Serviços', href: '#servicos' },
  { label: 'Materiais', href: '#materiais' },
  { label: 'Cases', href: '#projetos' },
  { label: 'Diferenciais', href: '#diferenciais' },
  { label: 'Contato', href: '#contato' },
];

export default function Header({ showServices = false }) {
  const [open, setOpen] = useState(false);
  const navLinks = showServices ? NAV_LINKS : NAV_LINKS.filter((link) => link.href !== '#servicos');

  return (
    <header className="fixed left-0 right-0 top-0 z-50 border-b border-white/5 bg-[#050505]/92 backdrop-blur-md">
      <div className="container-px flex h-20 items-center justify-between">
        <a href="#inicio" aria-label="Marmoraria MHT" className="transition hover:opacity-90">
          <Image src="/assets/logo/mht-logo-creme-ouro.webp" alt="MHT Marmoraria" width={1200} height={670} priority className="h-12 w-auto" />
        </a>

        <nav className="hidden items-center gap-9 lg:flex">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-display text-sm uppercase tracking-wide text-stone-150 transition-colors hover:text-gold-300"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <QuoteButton className="hidden items-center gap-2 rounded-sm border border-gold-400/70 px-6 py-3 font-display text-sm uppercase tracking-wide text-gold-200 transition hover:bg-gold-400 hover:text-ink-950 lg:inline-flex">
          <WhatsAppIcon size={16} className="shrink-0" />
          Pedir orçamento
        </QuoteButton>

        <button
          aria-label={open ? 'Fechar menu' : 'Abrir menu'}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-lg text-stone-150 transition hover:bg-white/5 lg:hidden"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {open && (
        <div className="flex flex-col gap-4 border-t border-white/5 bg-[#050505] px-6 pb-6 pt-3 lg:hidden">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="font-display text-sm uppercase tracking-wide text-stone-250 hover:text-gold-300"
            >
              {link.label}
            </a>
          ))}
          <QuoteButton className="btn-gold mt-2" onClick={() => setOpen(false)}>
            <WhatsAppIcon size={16} className="shrink-0" />
            Pedir orçamento
          </QuoteButton>
        </div>
      )}
    </header>
  );
}
