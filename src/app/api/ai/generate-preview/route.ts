import { NextResponse } from 'next/server';
import { normalizeBriefing } from '@/lib/ai/briefing';
import { negativePrompt } from '@/lib/ai/prompts';
import { PreviewError, renderPreviewViews } from '@/lib/ai/previews';
import { generatePreviewSchema } from '@/lib/ai/schemas';
import { addProjectVersion, createOrUpdateProject } from '@/lib/ai/store';

// Image generation takes a while; allows long runs on Vercel.
export const maxDuration = 300;

export async function POST(request: Request) {
  const parsed = generatePreviewSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Briefing inválido.' }, { status: 400 });
  }

  const briefing = normalizeBriefing(parsed.data.briefing);
  if (!briefing.ambiente || !briefing.pedra) {
    return NextResponse.json({ error: 'Conte qual é o ambiente e a pedra para eu gerar as prévias.' }, { status: 400 });
  }

  let images;
  try {
    images = await renderPreviewViews(briefing);
  } catch (error) {
    if (error instanceof PreviewError) return NextResponse.json({ error: error.message }, { status: 502 });
    throw error;
  }

  const project = await createOrUpdateProject(parsed.data.projectId, briefing);
  const version = await addProjectVersion({
    projectId: project.id,
    userRequest: parsed.data.userRequest,
    briefing,
    imagePrompt: images[0].prompt,
    negativePrompt,
    images,
  });

  return NextResponse.json({
    projectId: project.id,
    version,
    images: version.imagesJson,
  });
}
