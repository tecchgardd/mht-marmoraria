import { NextResponse } from 'next/server';
import { emptyBriefing, getNextBriefingQuestion, isBriefingReady, mergeBriefing } from '@/lib/ai/briefing';
import { runBriefingTurn } from '@/lib/ai/openai';
import { isValueQuestion, sanitizeAiResponse, specialistPricingResponse } from '@/lib/ai/sanitize';
import { chatRequestSchema } from '@/lib/ai/schemas';
import { createOrUpdateProject, getProject, projectToBriefing } from '@/lib/ai/store';

export async function POST(request: Request) {
  const parsed = chatRequestSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Mensagem inválida.' }, { status: 400 });
  }

  const existing = parsed.data.projectId ? await getProject(parsed.data.projectId) : null;
  const currentBriefing = existing ? projectToBriefing(existing) : emptyBriefing;

  if (isValueQuestion(parsed.data.message)) {
    const nextQuestion = getNextBriefingQuestion(currentBriefing);
    return NextResponse.json({
      projectId: existing?.id,
      response: nextQuestion ? `${specialistPricingResponse}\n\n${nextQuestion}` : specialistPricingResponse,
      briefing: currentBriefing,
      readyToGenerate: false,
    });
  }

  const aiTurn = await runBriefingTurn(parsed.data.message, currentBriefing).catch(() => null);
  const briefing = aiTurn?.briefing || mergeBriefing(currentBriefing, parsed.data.message);
  const project = await createOrUpdateProject(parsed.data.projectId, briefing);
  const readyToGenerate = isBriefingReady(briefing);

  const response =
    aiTurn?.response ||
    (readyToGenerate ? 'Perfeito, vou gerar as prévias conceituais.' : getNextBriefingQuestion(briefing));

  return NextResponse.json({
    projectId: project.id,
    response: sanitizeAiResponse(response),
    briefing,
    readyToGenerate,
  });
}
