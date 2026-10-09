import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/session';
import { deleteQuoteRequest, updateQuoteStatus } from '@/lib/quotes/repository';

type Params = { params: Promise<{ id: string }> };

const statusSchema = z.object({ status: z.enum(['NEW', 'CONTACTED', 'CLOSED', 'LOST']) });

export async function PATCH(request: Request, { params }: Params) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }
  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Status inválido.' }, { status: 400 });
  }

  const { id } = await params;
  if (!(await updateQuoteStatus(id, parsed.data.status))) {
    return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: Params) {
  if (!(await getCurrentUser())) {
    return NextResponse.json({ error: 'Faça login para continuar.' }, { status: 401 });
  }
  const { id } = await params;
  if (!(await deleteQuoteRequest(id))) {
    return NextResponse.json({ error: 'Pedido não encontrado.' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
