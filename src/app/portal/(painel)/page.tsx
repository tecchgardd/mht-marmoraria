import Media from '@/components/Media';
import Link from 'next/link';
import { ArrowUpRight, Clapperboard, Gem, Inbox, MessageCircle, Plus, Sparkles, Trophy, Wrench, type LucideIcon } from 'lucide-react';
import { cardClass } from '@/components/portal/styles';
import { getLeadsOverview } from '@/lib/ai/store';
import { getContentOverview } from '@/lib/content/repository';
import { contentKinds, type ContentKind } from '@/lib/content/types';
import { missingCloudinaryConfig } from '@/lib/portal/config';
import { getQuoteOverview } from '@/lib/quotes/repository';

const TIME_ZONE = 'America/Sao_Paulo';

const kindIcons: Record<ContentKind, LucideIcon> = { service: Wrench, material: Gem, case: Trophy, banner: Clapperboard };

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', timeZone: TIME_ZONE });
}

function whatsappLink(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;
}

function SectionTitle({ title, action }: { title: string; action?: { href: string; label: string } }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-5 pb-3 pt-5">
      <h2 className="font-display text-sm uppercase tracking-widest2 text-stone-150">{title}</h2>
      {action && (
        <Link href={action.href} className="-mx-2 inline-flex items-center gap-1 rounded-lg px-2 py-2 text-xs text-stone-250 transition hover:text-gold-300">
          {action.label}
          <ArrowUpRight size={13} />
        </Link>
      )}
    </div>
  );
}

export default async function PortalHomePage() {
  const [content, leads, quotes] = await Promise.all([getContentOverview(), getLeadsOverview(), getQuoteOverview()]);

  // Form quotes and AI assistant leads in a single list, newest first.
  const contacts = [
    ...quotes.recent.map((quote) => ({
      id: quote.id,
      name: quote.name,
      detail: quote.services.join(', '),
      phone: quote.phone,
      createdAt: quote.createdAt,
      isNew: quote.status === 'NEW',
      source: 'Formulário',
    })),
    ...leads.recent.map((lead) => ({
      id: lead.id,
      name: lead.customerName,
      detail: [lead.environment, lead.stone].filter(Boolean).join(' · ') || 'Projeto sem briefing',
      phone: lead.customerWhatsapp,
      createdAt: lead.createdAt,
      isNew: lead.status === 'NEW',
      source: 'Assistente IA',
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);
  const missingCloudinary = missingCloudinaryConfig();
  const today = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: TIME_ZONE });

  return (
    <div className="space-y-8">
      {/* Cabeçalho */}
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="font-display text-xs uppercase tracking-widest2 text-gold-300">{today}</p>
          <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-stone-150 md:text-4xl">Visão geral</h1>
          <p className="mt-1 text-sm text-stone-250">Pedidos de orçamento, contatos do assistente de IA e o que está publicado no site.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {(Object.keys(contentKinds) as ContentKind[]).map((kind) => (
            <Link
              key={kind}
              href={`/portal/${contentKinds[kind].slug}/novo`}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-2 text-xs text-stone-150 transition hover:border-gold-400/50 hover:text-gold-200"
            >
              <Plus size={13} />
              {contentKinds[kind].singular.charAt(0).toUpperCase() + contentKinds[kind].singular.slice(1)}
            </Link>
          ))}
        </div>
      </header>

      {missingCloudinary.length > 0 && (
        <p className="rounded-xl border border-amber-500/25 bg-amber-500/[0.07] px-4 py-3 text-sm text-amber-200">
          Envio de fotos desativado. Configure no ambiente: {missingCloudinary.join(', ')}.
        </p>
      )}

      {/* Indicadores */}
      <section className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
        <Link
          href="/portal/orcamentos"
          className="group relative col-span-2 overflow-hidden rounded-2xl border border-gold-400/40 bg-gradient-to-br from-gold-400/[0.22] via-gold-400/[0.06] to-transparent p-4 transition hover:-translate-y-0.5 sm:p-5 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/20 text-gold-100">
              <Inbox size={18} strokeWidth={1.8} />
            </span>
            <ArrowUpRight size={16} className="text-gold-200 opacity-0 transition group-hover:opacity-100" />
          </div>
          <p className="mt-5 font-display text-4xl text-gold-100">{quotes.newCount}</p>
          <p className="mt-1 text-sm text-gold-100/80">{quotes.newCount === 1 ? 'Orçamento novo' : 'Orçamentos novos'}</p>
          <p className="mt-3 text-xs text-stone-250">{quotes.total} pedidos no total</p>
        </Link>

        {(Object.keys(contentKinds) as ContentKind[]).map((kind) => {
          const Icon = kindIcons[kind];
          const { published, draft } = content.counts[kind];
          return (
            <Link key={kind} href={`/portal/${contentKinds[kind].slug}`} className={`${cardClass} group relative overflow-hidden p-4 transition hover:-translate-y-0.5 hover:border-gold-400/40 sm:p-5`}>
              <div className="flex items-center justify-between">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.04] text-gold-300">
                  <Icon size={18} strokeWidth={1.8} />
                </span>
                <ArrowUpRight size={16} className="text-stone-250 opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-4 font-display text-3xl text-stone-150 sm:mt-5 sm:text-4xl">{published}</p>
              <p className="mt-1 text-xs text-stone-250 sm:text-sm">
                {contentKinds[kind].label} {published === 1 ? 'publicado' : 'publicados'}
              </p>
              {draft > 0 && <p className="mt-3 text-xs text-gold-200/80">{draft} em rascunho</p>}
            </Link>
          );
        })}

        <div className="relative col-span-2 overflow-hidden rounded-2xl border border-gold-400/30 bg-gradient-to-br from-gold-400/[0.16] via-gold-400/[0.05] to-transparent p-4 sm:col-span-1 sm:p-5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gold-400/15 text-gold-200">
            <Sparkles size={18} strokeWidth={1.8} />
          </span>
          <p className="mt-5 font-display text-4xl text-gold-100">{leads.newCount}</p>
          <p className="mt-1 text-sm text-gold-100/80">{leads.newCount === 1 ? 'Lead novo' : 'Leads novos'} da IA</p>
          <p className="mt-3 text-xs text-stone-250">
            {leads.total} no total · {leads.projects} {leads.projects === 1 ? 'projeto criado' : 'projetos criados'}
          </p>
        </div>
      </section>

      <section className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Leads */}
        <div className={`${cardClass} flex flex-col`}>
          <SectionTitle title="Contatos recentes" action={{ href: '/portal/orcamentos', label: 'Ver orçamentos' }} />
          {contacts.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-5 pb-8 pt-4 text-center">
              <MessageCircle size={22} className="mx-auto text-stone-250/60" />
              <p className="mt-3 max-w-xs text-sm text-stone-250">
                Pedidos do formulário de orçamento e do{' '}
                <Link href="/assistente-ia" target="_blank" className="text-gold-300 hover:text-gold-200">assistente de IA</Link> aparecem aqui.
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-white/[0.06] pb-2">
              {contacts.map((contact) => (
                <li key={contact.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 truncate text-sm text-stone-150">
                      {contact.name}
                      {contact.isNew && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" aria-label="novo" />}
                      <span className="rounded-full bg-white/[0.06] px-2 py-0.5 text-[10px] uppercase tracking-wide text-stone-250">{contact.source}</span>
                    </p>
                    <p className="truncate text-xs text-stone-250">
                      {contact.detail} · {formatDate(contact.createdAt)}
                    </p>
                  </div>
                  <a
                    href={whatsappLink(contact.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-emerald-500/30 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-500/10"
                  >
                    <MessageCircle size={13} />
                    WhatsApp
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Últimas edições */}
        <div className={cardClass}>
          <SectionTitle title="Últimas edições" />
          {content.recent.length === 0 ? (
            <p className="px-5 pb-8 pt-4 text-center text-sm text-stone-250">Nada cadastrado ainda.</p>
          ) : (
            <ul className="pb-2">
              {content.recent.map((item) => (
                <li key={item.id}>
                  <Link href={`/portal/${contentKinds[item.kind].slug}/${item.id}`} className="flex items-center gap-3 px-5 py-2.5 transition hover:bg-white/[0.03]">
                    <span className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg bg-black">
                      {item.images[0] && <Media media={item.images[0]} alt="" sizes="56px" videoMode="still" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-stone-150">{item.title}</span>
                      <span className="block truncate text-xs text-stone-250">
                        {contentKinds[item.kind].label} · {formatDate(item.updatedAt)}
                      </span>
                    </span>
                    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] ${item.published ? 'bg-emerald-500/10 text-emerald-300' : 'bg-white/[0.06] text-stone-250'}`}>
                      {item.published ? 'No site' : 'Rascunho'}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
