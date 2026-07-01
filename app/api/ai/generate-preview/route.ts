import { NextResponse } from 'next/server';
import { buildImagePrompt, negativePrompt, viewTypes } from '@/lib/ai/prompts';
import { generateImageDataUrl } from '@/lib/ai/openai';
import { generatePreviewSchema } from '@/lib/ai/schemas';
import { addProjectVersion, createOrUpdateProject, createProjectImage, getVersions } from '@/lib/ai/store';
import type { ProjectImageType } from '@/lib/ai/types';

const fallbackImageSets = {
  cozinha: [
    '/assets/cozinha/cozinha1.webp',
    '/assets/marmores/ma1.webp',
    '/assets/quartzo/qa1.webp',
    '/assets/granitos/granito1.webp',
  ],
  banheiro: [
    '/assets/banheiro/banheiro1.webp',
    '/assets/granitos/granito1.webp',
    '/assets/granitos/granito2.webp',
    '/assets/marmores/ma2.webp',
  ],
  gourmet: [
    '/assets/areagourmet/area1.webp',
    '/assets/cozinha/cozinha1.webp',
    '/assets/granitos/granito2.webp',
    '/assets/quartzo/qa2.webp',
  ],
  escada: [
    '/assets/escadas/escadas1.webp',
    '/assets/granitos/granito3.webp',
    '/assets/marmores/ma3.webp',
    '/assets/quartzo/qa3.webp',
  ],
};

function fallbackImage(environment: string, index: number) {
  const normalized = environment.toLowerCase();
  const key = normalized.includes('banheiro')
    ? 'banheiro'
    : normalized.includes('gourmet')
      ? 'gourmet'
      : normalized.includes('escada')
        ? 'escada'
        : 'cozinha';
  return fallbackImageSets[key][index % fallbackImageSets[key].length];
}

export async function POST(request: Request) {
  const body = await request.json();
  const parsed = generatePreviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Briefing inválido.' }, { status: 400 });
  }

  const project = createOrUpdateProject(parsed.data.projectId, parsed.data.briefing);
  const previousVersions = getVersions(project.id);
  const previousContext = previousVersions.at(-1)
    ? JSON.stringify(previousVersions.at(-1)?.briefingJson)
    : 'Primeira versão do projeto.';

  const images = [];
  const prompts = [];

  for (let index = 0; index < viewTypes.length; index += 1) {
    const view = viewTypes[index];
    const prompt = buildImagePrompt(parsed.data.briefing, view.prompt, previousContext);
    prompts.push(prompt);
    const generated = await generateImageDataUrl(`${prompt}\n\nNegative prompt: ${negativePrompt}`);
    images.push(
      createProjectImage({
        type: view.key as ProjectImageType,
        imageUrl: generated || fallbackImage(parsed.data.briefing.ambiente || 'Cozinha', index),
        prompt,
      }),
    );
  }

  const version = addProjectVersion({
    projectId: project.id,
    userRequest: parsed.data.userRequest,
    briefingJson: parsed.data.briefing,
    imagePrompt: prompts[0],
    negativePrompt,
    imagesJson: images,
  });

  return NextResponse.json({
    projectId: project.id,
    version,
    images: version.imagesJson,
  });
}
