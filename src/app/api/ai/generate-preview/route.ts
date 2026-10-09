import { NextResponse } from 'next/server';
import { negativePrompt } from '@/lib/ai/prompts';
import { renderPreviewViews } from '@/lib/ai/previews';
import { generatePreviewSchema } from '@/lib/ai/schemas';
import { addProjectVersion, createOrUpdateProject, getLatestVersion } from '@/lib/ai/store';

// Image generation takes a while; allows long runs on Vercel.
export const maxDuration = 300;

export async function POST(request: Request) {
  const parsed = generatePreviewSchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json({ error: 'Briefing inválido.' }, { status: 400 });
  }

  const project = await createOrUpdateProject(parsed.data.projectId, parsed.data.briefing);
  const previousVersion = await getLatestVersion(project.id);
  const previousContext = previousVersion ? JSON.stringify(previousVersion.briefingJson) : 'Primeira versão do projeto.';

  const images = await renderPreviewViews(parsed.data.briefing, previousContext);

  const version = await addProjectVersion({
    projectId: project.id,
    userRequest: parsed.data.userRequest,
    briefing: parsed.data.briefing,
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
