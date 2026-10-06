import { NextResponse } from 'next/server';
import { sanitizeAiResponse } from '@/lib/ai/sanitize';
import { sendToSpecialistSchema } from '@/lib/ai/schemas';
import { createLead, getProject } from '@/lib/ai/store';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const parsed = sendToSpecialistSchema.safeParse(body);
  const { id } = await params;

  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados de contato inválidos.' }, { status: 400 });
  }

  const project = getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }

  const lead = createLead(id, {
    customerName: parsed.data.customerName,
    customerWhatsapp: parsed.data.customerWhatsapp,
    message: sanitizeAiResponse(parsed.data.message),
  });

  return NextResponse.json({ lead, status: 'SENT_TO_SPECIALIST' });
}
