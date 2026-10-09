'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Inbox, Mail, MapPin, MessageCircle, Ruler, Trash2 } from 'lucide-react';
import type { LeadStatus } from '@/lib/ai/types';
import type { QuoteRequest } from '@/lib/quotes/repository';
import { ConfirmDialog } from './Modal';
import { cardClass, dangerButtonClass, readError } from './styles';

const STATUS: Record<LeadStatus, { label: string; className: string }> = {
  NEW: { label: 'Novo', className: 'bg-gold-400/15 text-gold-200 border-gold-400/30' },
  CONTACTED: { label: 'Em contato', className: 'bg-sky-500/10 text-sky-300 border-sky-500/30' },
  CLOSED: { label: 'Fechado', className: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' },
  LOST: { label: 'Perdido', className: 'bg-white/[0.06] text-stone-250 border-white/10' },
};

const FILTERS: Array<{ value: LeadStatus | 'ALL'; label: string }> = [
  { value: 'ALL', label: 'Todos' },
  { value: 'NEW', label: 'Novos' },
  { value: 'CONTACTED', label: 'Em contato' },
  { value: 'CLOSED', label: 'Fechados' },
  { value: 'LOST', label: 'Perdidos' },
];

function replyLink(quote: QuoteRequest) {
  const digits = quote.phone.replace(/\D/g, '');
  const number = digits.length <= 11 ? `55${digits}` : digits;
  const text = `Olá, ${quote.name.split(' ')[0]}! Aqui é da MHT Marmoraria. Recebemos seu pedido de orçamento (${quote.services.join(', ')}).`;
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
}

export default function QuotesManager({ quotes }: { quotes: QuoteRequest[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<LeadStatus | 'ALL'>('ALL');
  const [deleting, setDeleting] = useState<QuoteRequest | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const visible = filter === 'ALL' ? quotes : quotes.filter((quote) => quote.status === filter);
  const count = (status: LeadStatus | 'ALL') => (status === 'ALL' ? quotes.length : quotes.filter((quote) => quote.status === status).length);

  async function changeStatus(quote: QuoteRequest, status: LeadStatus) {
    setError('');
    const response = await fetch(`/api/portal/quotes/${quote.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (response.ok) router.refresh();
    else setError(await readError(response, 'Não foi possível alterar o status.'));
  }

  async function handleDelete() {
    if (!deleting) return;
    setBusy(true);
    const response = await fetch(`/api/portal/quotes/${deleting.id}`, { method: 'DELETE' });
    if (response.ok) router.refresh();
    else setError(await readError(response, 'Não foi possível excluir.'));
    setBusy(false);
    setDeleting(null);
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            onClick={() => setFilter(value)}
            aria-pressed={filter === value}
            className={`rounded-full border px-4 py-2.5 text-xs transition ${
              filter === value ? 'border-gold-400 bg-gold-400/15 text-gold-100' : 'border-white/10 text-stone-250 hover:border-white/25 hover:text-stone-150'
            }`}
          >
            {label} <span className="ml-1 text-white/40">{count(value)}</span>
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-300" role="alert">{error}</p>}

      {visible.length === 0 ? (
        <div className={`${cardClass} mt-6 px-6 py-14 text-center`}>
          <Inbox size={26} className="mx-auto text-stone-250/60" />
          <p className="mt-3 text-sm text-stone-250">
            {quotes.length ? 'Nenhum pedido neste filtro.' : 'Os pedidos feitos pelo formulário de orçamento do site aparecem aqui.'}
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {visible.map((quote) => (
            <li key={quote.id} className={`${cardClass} p-5`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-medium text-stone-150">{quote.name}</p>
                    <span className={`rounded-full border px-2.5 py-0.5 text-[11px] ${STATUS[quote.status].className}`}>{STATUS[quote.status].label}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-stone-250">
                    {formatDate(quote.createdAt)}
                    {quote.topic && ` · interesse: ${quote.topic}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={quote.status}
                    onChange={(event) => changeStatus(quote, event.target.value as LeadStatus)}
                    aria-label={`Status do pedido de ${quote.name}`}
                    className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-stone-150 outline-none focus:border-gold-400/60"
                  >
                    {(Object.keys(STATUS) as LeadStatus[]).map((status) => (
                      <option key={status} value={status}>
                        {STATUS[status].label}
                      </option>
                    ))}
                  </select>
                  <a
                    href={replyLink(quote)}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => quote.status === 'NEW' && changeStatus(quote, 'CONTACTED')}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-500"
                  >
                    <MessageCircle size={14} />
                    Responder
                  </a>
                  <button type="button" onClick={() => setDeleting(quote)} aria-label={`Excluir pedido de ${quote.name}`} className={dangerButtonClass}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5">
                {quote.services.map((service) => (
                  <span key={service} className="rounded-full border border-gold-400/25 bg-gold-400/[0.08] px-2.5 py-1 text-xs text-gold-100">
                    {service}
                  </span>
                ))}
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
                <div className="flex items-start gap-2">
                  <Ruler size={14} className="mt-1 shrink-0 text-gold-300" />
                  <span>
                    <dt className="text-xs text-stone-250">Metragem</dt>
                    <dd className="text-stone-150">{quote.hasMeasurements ? quote.measurements : 'Precisa de medição'}</dd>
                  </span>
                </div>
                <div>
                  <dt className="text-xs text-stone-250">Pedra / cor</dt>
                  <dd className="text-stone-150">{[quote.stoneType, quote.stoneColor].filter(Boolean).join(' · ') || 'A definir'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-stone-250">Telefone</dt>
                  <dd className="text-stone-150">{quote.phone}</dd>
                </div>
                {quote.email && (
                  <div className="flex items-start gap-2">
                    <Mail size={14} className="mt-1 shrink-0 text-gold-300" />
                    <span>
                      <dt className="text-xs text-stone-250">E-mail</dt>
                      <dd>
                        <a href={`mailto:${quote.email}`} className="text-stone-150 hover:text-gold-200">{quote.email}</a>
                      </dd>
                    </span>
                  </div>
                )}
                {(quote.address || quote.city) && (
                  <div className="flex items-start gap-2 sm:col-span-2">
                    <MapPin size={14} className="mt-1 shrink-0 text-gold-300" />
                    <span>
                      <dt className="text-xs text-stone-250">Endereço da obra</dt>
                      <dd className="text-stone-150">{[quote.address, quote.city].filter(Boolean).join(' - ')}</dd>
                    </span>
                  </div>
                )}
              </dl>
              {quote.notes && <p className="mt-4 rounded-xl bg-white/[0.03] px-4 py-3 text-sm leading-relaxed text-stone-150/85">{quote.notes}</p>}
            </li>
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={Boolean(deleting)}
        onCancel={() => setDeleting(null)}
        onConfirm={handleDelete}
        isLoading={busy}
        title="Excluir pedido"
        description={`O pedido de ${deleting?.name ?? ''} será removido do portal.`}
      />
    </>
  );
}
