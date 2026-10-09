import QuotesManager from '@/components/portal/QuotesManager';
import { listQuoteRequests } from '@/lib/quotes/repository';

export default async function QuotesPage() {
  const quotes = await listQuoteRequests();

  return (
    <>
      <div className="mb-8">
        <p className="font-display text-xs uppercase tracking-widest2 text-gold-300">Atendimento</p>
        <h1 className="mt-1 font-display text-3xl uppercase tracking-wide text-stone-150">Orçamentos</h1>
        <p className="mt-1 text-sm text-stone-250">Pedidos feitos pelo formulário do site antes de seguir para o WhatsApp.</p>
      </div>
      <QuotesManager quotes={quotes} />
    </>
  );
}
