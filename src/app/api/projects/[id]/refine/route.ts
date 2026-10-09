import { NextResponse } from 'next/server';
import { negativePrompt } from '@/lib/ai/prompts';
import { briefingFieldLabels } from '@/lib/ai/briefing';
import { interpretRefinement } from '@/lib/ai/openai';
import { renderPreviewViews } from '@/lib/ai/previews';
import { isValueQuestion, specialistPricingResponse } from '@/lib/ai/sanitize';
import { refineRequestSchema } from '@/lib/ai/schemas';
import { addProjectVersion, createOrUpdateProject, getLatestVersion, getProject, projectToBriefing } from '@/lib/ai/store';
import type { Briefing } from '@/lib/ai/types';

// Image generation takes a while; allows long runs on Vercel.
export const maxDuration = 300;

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const parsed = refineRequestSchema.safeParse(await request.json().catch(() => null));
  const { id } = await params;

  if (!parsed.success) {
    return NextResponse.json({ error: 'Pedido de alteração inválido.' }, { status: 400 });
  }

  const project = await getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }

  const briefing = parsed.data.briefing || projectToBriefing(project);
  const message = parsed.data.message;

  if (isValueQuestion(message)) {
    return NextResponse.json({ projectId: id, response: specialistPricingResponse, briefing });
  }

  const decision = await interpretRefinement(message, briefing).catch(() => null);

  if (decision?.action === 'ask') {
    return NextResponse.json({ projectId: id, response: decision.response, briefing });
  }

  // Without the AI, the request is kept as a note so the image still reflects it.
  const changes: Partial<Briefing> = decision?.changes || {
    observacoes: [briefing.observacoes, `Ajuste: ${message}`].filter(Boolean).join('\n'),
  };
  const updatedBriefing = { ...briefing, ...changes };
  await createOrUpdateProject(id, updatedBriefing);

  const changeSummary = (Object.keys(changes) as Array<keyof Briefing>)
    .map((field) => `${briefingFieldLabels[field]}: ${updatedBriefing[field]}`)
    .join('; ');

  const previousVersion = await getLatestVersion(id);
  const previousContext = JSON.stringify(previousVersion?.briefingJson || briefing);
  const images = await renderPreviewViews(
    updatedBriefing,
    previousContext,
    `Alterar apenas: ${changeSummary}.\nPreservar todo o restante do projeto exatamente igual à versão anterior.`,
  );

  const version = await addProjectVersion({
    projectId: id,
    userRequest: message,
    briefing: updatedBriefing,
    imagePrompt: images[0].prompt,
    negativePrompt,
    images,
  });

  return NextResponse.json({
    projectId: id,
    version,
    images: version.imagesJson,
    briefing: updatedBriefing,
    response: decision?.response || 'Ajuste aplicado. Mantive o restante do projeto.',
  });
}
