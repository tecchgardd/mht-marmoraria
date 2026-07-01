import { NextResponse } from 'next/server';
import { emptyBriefing, getNextBriefingQuestion, isBriefingReady, mergeBriefing } from '@/lib/ai/briefing';
import { generateChatResponse } from '@/lib/ai/openai';
import { isValueQuestion, sanitizeAiResponse, specialistPricingResponse } from '@/lib/ai/sanitize';
import { chatRequestSchema } from '@/lib/ai/schemas';
import { createOrUpdateProject, getProject } from '@/lib/ai/store';

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = chatRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Mensagem inválida.' }, { status: 400 });
  }

  const existing = parsed.data.projectId ? getProject(parsed.data.projectId) : null;
  const currentBriefing = existing
    ? {
        ambiente: existing.environmentType,
        estilo: existing.style,
        pedra: existing.stoneType,
        coresMoveis: existing.furnitureColors,
        bancada: existing.countertopType,
        pia: existing.sinkType,
        iluminacao: existing.lighting,
        medidasAproximadas: existing.approximateMeasures,
        referencias: existing.references,
        observacoes: existing.notes,
      }
    : emptyBriefing;

  const briefing = mergeBriefing(currentBriefing, parsed.data.message);
  const project = createOrUpdateProject(parsed.data.projectId, briefing);

  const readyToGenerate = isBriefingReady(briefing);
  const nextQuestion = getNextBriefingQuestion(briefing);
  const response = isValueQuestion(parsed.data.message)
    ? specialistPricingResponse
    : readyToGenerate
      ? await generateChatResponse(parsed.data.message, briefing)
      : `Perfeito, anotei.\n\n${nextQuestion}`;

  return NextResponse.json({
    projectId: project.id,
    response: sanitizeAiResponse(response),
    briefing,
    readyToGenerate,
  });
}
