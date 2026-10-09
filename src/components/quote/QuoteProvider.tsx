'use client';

import { createContext, useContext, useState, type FormEvent, type ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Ruler } from 'lucide-react';
import Modal from '@/components/portal/Modal';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { whatsappUrl } from '@/lib/company/profile';
import {
  COLOR_OPTIONS,
  SERVICE_OPTIONS,
  STONE_OPTIONS,
  buildQuoteMessage,
  formatPhone,
  type QuoteRequestInput,
} from '@/lib/quotes/schema';

type QuoteContextValue = { open: (topic?: string) => void };

const QuoteContext = createContext<QuoteContextValue>({ open: () => undefined });

export function useQuote() {
  return useContext(QuoteContext);
}

const STEPS = ['Serviço', 'Detalhes', 'Contato'];

const emptyForm = {
  services: [] as string[],
  hasMeasurements: null as boolean | null,
  measurements: '',
  stoneType: '',
  stoneName: '',
  stoneColor: '',
  notes: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
};

function Chip({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition ${
        selected ? 'border-gold-400 bg-gold-400/15 text-gold-100' : 'border-white/10 bg-white/[0.02] text-stone-150/85 hover:border-white/25'
      }`}
    >
      {selected && <Check size={14} className="shrink-0 text-gold-300" />}
      {children}
    </button>
  );
}

const inputClass =
  'w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-3 text-sm text-stone-150 outline-none transition placeholder:text-white/30 focus:border-gold-400/60';
const labelClass = 'mb-2 block text-xs font-medium uppercase tracking-wide text-stone-250';

export default function QuoteProvider({ whatsapp, children }: { whatsapp: string; children: ReactNode }) {
  const [openState, setOpenState] = useState(false);
  const [topic, setTopic] = useState('');
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);
  const [sentLink, setSentLink] = useState('');

  function open(nextTopic = '') {
    setTopic(nextTopic);
    setStep(0);
    setError('');
    setSentLink('');
    setOpenState(true);
  }

  function update<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setError('');
  }

  function toggleService(service: string) {
    update('services', form.services.includes(service) ? form.services.filter((item) => item !== service) : [...form.services, service]);
  }

  function validateStep() {
    if (step === 0 && !form.services.length) return 'Escolha pelo menos um serviço.';
    if (step === 1 && form.hasMeasurements === null) return 'Conte se você já sabe a metragem.';
    if (step === 1 && form.hasMeasurements && !form.measurements.trim()) return 'Informe a metragem ou marque que ainda não sabe.';
    if (step === 2 && form.name.trim().length < 2) return 'Informe seu nome.';
    if (step === 2 && form.phone.replace(/\D/g, '').length < 10) return 'Informe um telefone com DDD.';
    return '';
  }

  function next() {
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }
    setStep((current) => current + 1);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < STEPS.length - 1) {
      next();
      return;
    }
    const message = validateStep();
    if (message) {
      setError(message);
      return;
    }

    const honeypot = String(new FormData(event.currentTarget).get('website') ?? '');
    const payload: QuoteRequestInput = {
      services: form.services,
      hasMeasurements: Boolean(form.hasMeasurements),
      measurements: form.hasMeasurements ? form.measurements.trim() : '',
      stoneType: [form.stoneType, form.stoneName.trim()].filter(Boolean).join(' — '),
      stoneColor: form.stoneColor,
      notes: form.notes.trim(),
      name: form.name.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      address: form.address.trim(),
      city: form.city.trim(),
      topic,
      website: honeypot,
    };

    // Opened right away (inside the click) so browsers do not block it as a pop-up.
    const popup = window.open('', '_blank');
    setSending(true);
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (response.status === 400) {
        popup?.close();
        const data = await response.json().catch(() => ({}));
        setError(data.error || 'Confira os dados informados.');
        return;
      }
    } catch {
      // Even if saving fails, the customer still reaches us on WhatsApp.
    } finally {
      setSending(false);
    }

    const link = whatsappUrl({ whatsapp, whatsappMessage: '' }, buildQuoteMessage(payload));
    if (popup) popup.location.href = link;
    setSentLink(link);
    setForm(emptyForm);
  }

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <QuoteContext.Provider value={{ open }}>
      {children}

      <Modal
        open={openState}
        onClose={() => setOpenState(false)}
        title={sentLink ? 'Pedido enviado!' : 'Solicite seu orçamento'}
        description={sentLink ? undefined : topic ? `Interesse: ${topic}` : 'Três passos rápidos para nosso especialista já chegar com a proposta certa.'}
        size="lg"
        footer={
          sentLink ? (
            <>
              <button type="button" onClick={() => setOpenState(false)} className="rounded-md px-4 py-2.5 text-sm text-stone-250 transition hover:bg-white/5 hover:text-stone-150">
                Fechar
              </button>
              <a href={sentLink} target="_blank" rel="noopener noreferrer" className="btn-gold px-6 py-3">
                <WhatsAppIcon size={16} className="shrink-0" />
                Abrir WhatsApp
              </a>
            </>
          ) : (
            <>
              {step > 0 && (
                <button type="button" onClick={() => setStep((current) => current - 1)} className="mr-auto flex items-center gap-1.5 rounded-md px-3 py-2.5 text-sm text-stone-250 transition hover:bg-white/5 hover:text-stone-150">
                  <ArrowLeft size={15} />
                  Voltar
                </button>
              )}
              <button type="submit" form="quote-form" disabled={sending} className="btn-gold px-6 py-3 disabled:opacity-60">
                {step < STEPS.length - 1 ? (
                  <>
                    Continuar <ArrowRight size={16} />
                  </>
                ) : (
                  <>
                    <WhatsAppIcon size={16} className="shrink-0" />
                    {sending ? 'Enviando...' : 'Enviar e abrir WhatsApp'}
                  </>
                )}
              </button>
            </>
          )
        }
      >
        {sentLink ? (
          <div className="py-4 text-center">
            <CheckCircle2 size={44} className="mx-auto text-gold-300" />
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-stone-150/85">
              Recebemos seu pedido e abrimos o WhatsApp com tudo organizado. É só tocar em enviar por lá. Se a janela não abriu, use o botão abaixo.
            </p>
          </div>
        ) : (
          <form id="quote-form" onSubmit={handleSubmit} noValidate>
            {/* Progresso */}
            <div className="mb-6">
              <div className="flex justify-between text-[11px] uppercase tracking-widest2 text-stone-250">
                {STEPS.map((label, index) => (
                  <span key={label} className={index <= step ? 'text-gold-300' : ''}>
                    {index + 1}. {label}
                  </span>
                ))}
              </div>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gold-300 transition-[width] duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {step === 0 && (
              <fieldset>
                <legend className={labelClass}>O que você precisa? (pode marcar mais de um)</legend>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {SERVICE_OPTIONS.map((service) => (
                    <Chip key={service} selected={form.services.includes(service)} onClick={() => toggleService(service)}>
                      {service}
                    </Chip>
                  ))}
                </div>
              </fieldset>
            )}

            {step === 1 && (
              <div className="space-y-6">
                <fieldset>
                  <legend className={labelClass}>Você já sabe a metragem?</legend>
                  <div className="grid grid-cols-2 gap-2">
                    <Chip selected={form.hasMeasurements === true} onClick={() => update('hasMeasurements', true)}>
                      <Ruler size={14} /> Sim, já sei
                    </Chip>
                    <Chip selected={form.hasMeasurements === false} onClick={() => update('hasMeasurements', false)}>
                      Não, preciso de medição
                    </Chip>
                  </div>
                  {form.hasMeasurements && (
                    <input
                      autoFocus
                      value={form.measurements}
                      onChange={(event) => update('measurements', event.target.value)}
                      maxLength={200}
                      placeholder="Ex.: 3,5 m² ou bancada de 2,40 x 0,60 m"
                      aria-label="Metragem"
                      className={`${inputClass} mt-3`}
                    />
                  )}
                </fieldset>

                <fieldset>
                  <legend className={labelClass}>Tipo de pedra</legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {STONE_OPTIONS.map((stone) => (
                      <Chip key={stone} selected={form.stoneType === stone} onClick={() => update('stoneType', form.stoneType === stone ? '' : stone)}>
                        {stone}
                      </Chip>
                    ))}
                  </div>
                  <input
                    value={form.stoneName}
                    onChange={(event) => update('stoneName', event.target.value)}
                    maxLength={60}
                    placeholder="Nome da pedra, se souber (ex.: Preto São Gabriel)"
                    aria-label="Nome da pedra"
                    className={`${inputClass} mt-3`}
                  />
                </fieldset>

                <fieldset>
                  <legend className={labelClass}>Cor</legend>
                  <div className="grid grid-cols-3 gap-2">
                    {COLOR_OPTIONS.map((color) => (
                      <Chip key={color} selected={form.stoneColor === color} onClick={() => update('stoneColor', form.stoneColor === color ? '' : color)}>
                        {color}
                      </Chip>
                    ))}
                  </div>
                </fieldset>

                <div>
                  <label htmlFor="quote-notes" className={labelClass}>Algo mais? (opcional)</label>
                  <textarea
                    id="quote-notes"
                    value={form.notes}
                    onChange={(event) => update('notes', event.target.value)}
                    rows={2}
                    maxLength={1000}
                    placeholder="Ex.: cozinha em L com cooktop, prazo, referências..."
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="quote-name" className={labelClass}>Nome *</label>
                  <input id="quote-name" autoFocus autoComplete="name" value={form.name} onChange={(event) => update('name', event.target.value)} maxLength={120} className={inputClass} />
                </div>
                <div>
                  <label htmlFor="quote-phone" className={labelClass}>Telefone / WhatsApp *</label>
                  <input
                    id="quote-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    value={form.phone}
                    onChange={(event) => update('phone', formatPhone(event.target.value))}
                    placeholder="(48) 99999-9999"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label htmlFor="quote-email" className={labelClass}>E-mail</label>
                  <input id="quote-email" type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} maxLength={120} className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="quote-address" className={labelClass}>Endereço da obra</label>
                  <input id="quote-address" autoComplete="street-address" value={form.address} onChange={(event) => update('address', event.target.value)} maxLength={200} placeholder="Rua, número e bairro" className={inputClass} />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="quote-city" className={labelClass}>Cidade</label>
                  <input id="quote-city" autoComplete="address-level2" value={form.city} onChange={(event) => update('city', event.target.value)} maxLength={80} className={inputClass} />
                </div>
                {/* Anti-spam: escondido para pessoas, robôs costumam preencher. */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 opacity-0" />
              </div>
            )}

            {error && (
              <p ref={(node) => node?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })} className="mt-4 text-sm text-red-300" role="alert">
                {error}
              </p>
            )}
          </form>
        )}
      </Modal>
    </QuoteContext.Provider>
  );
}
