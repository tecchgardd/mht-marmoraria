'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#050505] px-6 text-center">
      <Image src="/assets/logo/mht-logo-creme-ouro.webp" alt="MHT Marmoraria" width={1200} height={670} className="h-auto w-32" />
      <h1 className="mt-10 font-display text-2xl uppercase tracking-wide text-stone-150 md:text-3xl">Algo deu errado</h1>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-stone-250">
        Não foi possível carregar esta página agora. Tente de novo em instantes.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <button type="button" onClick={reset} className="btn-gold">
          <RotateCcw size={16} />
          Tentar de novo
        </button>
        <Link href="/" className="btn-outline">
          Voltar ao site
        </Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-white/30">Código: {error.digest}</p>}
    </main>
  );
}
