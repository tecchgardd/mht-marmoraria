'use client';

import { CheckCircle2, MessageCircle } from 'lucide-react';
import { useState } from 'react';

type SendToSpecialistButtonProps = {
  projectId?: string;
};

export default function SendToSpecialistButton({ projectId }: SendToSpecialistButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerWhatsapp, setCustomerWhatsapp] = useState('');
  const [message, setMessage] = useState('Gostaria de enviar essa prévia conceitual para análise de um especialista.');
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!projectId) return;

    setStatus('sending');
    const response = await fetch(`/api/projects/${projectId}/send-to-specialist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customerName, customerWhatsapp, message }),
    });

    setStatus(response.ok ? 'sent' : 'error');
  }

  const steps = [
    'Revisão com especialista',
    'Confirmação de medidas',
    'Escolha final do material',
    'Proposta personalizada',
    'Acompanhamento comercial',
  ];

  return (
    <section className="rounded-2xl border border-[#7A1230]/35 bg-[#12070B] p-5 shadow-[0_18px_44px_rgba(0,0,0,0.22)]">
      <h2 className="text-sm font-semibold text-white">Próximos passos</h2>

      <div className="mt-5 space-y-3">
        {steps.map((step) => (
          <div key={step} className="flex items-center gap-2 text-sm text-white/60">
            <CheckCircle2 size={15} className="text-[#F2D28A]" />
            {step}
          </div>
        ))}
      </div>

      {!isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#C9A257] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#F2D28A]"
        >
          <MessageCircle size={16} />
          Enviar para especialista
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <input
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Seu nome"
            className="w-full rounded-lg border border-[#7A1230]/35 bg-[#050505] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#C9A257]/70"
            required
          />
          <input
            value={customerWhatsapp}
            onChange={(event) => setCustomerWhatsapp(event.target.value)}
            placeholder="WhatsApp"
            className="w-full rounded-lg border border-[#7A1230]/35 bg-[#050505] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#C9A257]/70"
            required
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-[#7A1230]/35 bg-[#050505] px-3 py-2.5 text-sm text-white outline-none focus:border-[#C9A257]/70"
            required
          />
          <button
            type="submit"
            disabled={!projectId || status === 'sending'}
            className="w-full rounded-lg bg-[#C9A257] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#F2D28A] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-white/30"
          >
            {status === 'sending' ? 'Enviando...' : 'Confirmar envio'}
          </button>
          {!projectId && <p className="text-xs text-white/45">Gere uma prévia para habilitar o envio.</p>}
          {status === 'sent' && <p className="text-xs text-[#C9A257]">Projeto enviado para acompanhamento comercial.</p>}
          {status === 'error' && <p className="text-xs text-red-300">Não foi possível enviar agora.</p>}
        </form>
      )}
    </section>
  );
}
