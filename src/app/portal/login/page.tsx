import Image from 'next/image';
import Link from 'next/link';
import { redirect, unstable_rethrow } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import LoginForm from '@/components/portal/LoginForm';
import { getCurrentUser } from '@/lib/auth/session';
import { hasAnyUser } from '@/lib/auth/users';
import { missingPortalConfig } from '@/lib/portal/config';

// Depends on the session cookie and the database: never prerender.
export const dynamic = 'force-dynamic';

async function getLoginState() {
  const missing = missingPortalConfig();
  if (missing.length > 0) return { status: 'missing-config' as const, missing };

  try {
    if (await getCurrentUser()) return { status: 'logged-in' as const };
    return { status: 'ready' as const, firstUser: !(await hasAnyUser()) };
  } catch (error) {
    // Lets Next.js handle its own control-flow errors (dynamic rendering, redirects).
    unstable_rethrow(error);
    console.error('Portal: falha ao acessar o banco.', error);
    return { status: 'database-error' as const };
  }
}

export default async function PortalLoginPage() {
  const state = await getLoginState();
  if (state.status === 'logged-in') redirect('/portal');

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_minmax(440px,0.9fr)]">
      {/* Painel visual */}
      <section className="relative hidden overflow-hidden lg:block">
        <Image src="/assets/logo/mht-placa.webp" alt="Placa MHT Marmoraria em mármore e latão" fill priority className="object-cover object-[12%_30%]" sizes="55vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/75 via-35% to-transparent to-70%" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#050505]/60" />
        <div className="absolute bottom-0 left-0 right-0 p-12 xl:p-16">
          <p className="font-display text-xs uppercase tracking-widest2 text-gold-300">Portal de conteúdo</p>
          <p className="mt-3 max-w-md font-display text-4xl font-semibold uppercase leading-[1.08] text-stone-150 xl:text-5xl">
            Cada projeto,
            <br />
            <span className="text-gold-300">uma vitrine</span>
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-stone-150/75">
            Cadastre serviços, materiais e cases de sucesso que aparecem no site da MHT.
          </p>
        </div>
      </section>

      {/* Formulário */}
      <section className="relative flex items-center justify-center overflow-hidden bg-[#050505] px-6 py-12 sm:px-10">
        <Image src="/assets/logo/mht-placa.webp" alt="" fill className="object-cover opacity-[0.07] lg:hidden" sizes="100vw" />
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-gold-400/10 blur-3xl" />

        <div className="relative w-full max-w-sm">
          <Image
            src="/assets/logo/mht-logo-creme-ouro.webp"
            alt="MHT Marmoraria"
            width={1200}
            height={670}
            priority
            className="mx-auto h-auto w-52"
          />

          <div className="mt-10">
            <h1 className="font-display text-2xl uppercase tracking-wide text-stone-150">
              {state.status === 'ready' && state.firstUser ? 'Criar primeiro acesso' : 'Acesso ao portal'}
            </h1>
            <div className="mt-3 h-px w-16 bg-gold-line" />
          </div>

          <div className="mt-8">
            {state.status === 'ready' && <LoginForm firstUser={state.firstUser} />}

            {state.status === 'missing-config' && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                <p>O portal ainda não está configurado. Defina no ambiente:</p>
                <ul className="mt-2 list-inside list-disc">
                  {state.missing.map((name) => <li key={name}>{name}</li>)}
                </ul>
              </div>
            )}

            {state.status === 'database-error' && (
              <div className="rounded-md border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                Não foi possível conectar ao banco de dados. Verifique o DATABASE_URL e se as migrations foram aplicadas
                (<code className="text-red-100">npm run db:deploy</code>).
              </div>
            )}
          </div>

          <Link href="/" className="mt-10 inline-flex items-center gap-2 text-sm text-stone-250 transition hover:text-gold-300">
            <ArrowLeft size={15} />
            Voltar para o site
          </Link>
        </div>
      </section>
    </main>
  );
}
