import { NextResponse } from 'next/server';
import { firstError } from '@/lib/portal/schemas';
import { createQuoteRequest } from '@/lib/quotes/repository';
import { quoteRequestSchema } from '@/lib/quotes/schema';

// Public endpoint: the site's quote form posts here before opening WhatsApp.
export async function POST(request: Request) {
  const parsed = quoteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
  }

  try {
    const quote = await createQuoteRequest(parsed.data);
    return NextResponse.json({ id: quote.id }, { status: 201 });
  } catch (error) {
    // The form still forwards the customer to WhatsApp; this only means the portal copy was not saved.
    console.error('Falha ao salvar pedido de orçamento:', error);
    return NextResponse.json({ error: 'Não foi possível registrar o pedido.' }, { status: 500 });
  }
}
