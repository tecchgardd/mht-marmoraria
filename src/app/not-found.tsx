import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export const metadata = { title: 'Página não encontrada | MHT Marmoraria' };

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#050505] px-6 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-full bg-gold-400/10 blur-3xl" aria-hidden="true" />
      <Image src="/assets/logo/mht-logo-creme-ouro.webp" alt="MHT Marmoraria" width={1200} height={670} className="relative h-auto w-36" priority />
      <p className="relative mt-12 font-display text-7xl text-gold-300 md:text-8xl">404</p>
      <h1 className="relative mt-4 font-display text-2xl uppercase tracking-wide text-stone-150 md:text-3xl">Página não encontrada</h1>
      <p className="relative mt-3 max-w-md text-sm leading-relaxed text-stone-250">
        O endereço pode ter mudado ou o conteúdo foi removido.
      </p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-gold">
          <ArrowLeft size={16} />
          Voltar ao site
        </Link>
        <Link href="/portal" className="btn-outline">
          Ir para o portal
        </Link>
      </div>
    </main>
  );
}
