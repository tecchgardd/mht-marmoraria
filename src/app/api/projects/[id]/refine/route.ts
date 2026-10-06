import { NextResponse } from 'next/server';
import { buildImagePrompt, negativePrompt, viewTypes } from '@/lib/ai/prompts';
import { generateImageDataUrl } from '@/lib/ai/openai';
import { refineRequestSchema } from '@/lib/ai/schemas';
import { addProjectVersion, createProjectImage, createOrUpdateProject, getProject, getVersions } from '@/lib/ai/store';
import type { Briefing, ProjectImageType } from '@/lib/ai/types';

const fallbackImages = [
  '/assets/cozinha/cozinha1.webp',
  '/assets/banheiro/banheiro1.webp',
  '/assets/areagourmet/area1.webp',
  '/assets/escadas/escadas1.webp',
  '/assets/granitos/granito1.webp',
  '/assets/marmores/ma1.webp',
  '/assets/quartzo/qa1.webp',
];

function projectToBriefing(project: NonNullable<ReturnType<typeof getProject>>): Briefing {
  return {
    ambiente: project.environmentType,
    estilo: project.style,
    pedra: project.stoneType,
    coresMoveis: project.furnitureColors,
    bancada: project.countertopType,
    pia: project.sinkType,
    iluminacao: project.lighting,
    medidasAproximadas: project.approximateMeasures,
    referencias: project.references,
    observacoes: project.notes,
  };
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const body = await request.json();
  const parsed = refineRequestSchema.safeParse(body);
  const { id } = await params;

  if (!parsed.success) {
    return NextResponse.json({ error: 'Pedido de alteração inválido.' }, { status: 400 });
  }

  const project = getProject(id);
  if (!project) {
    return NextResponse.json({ error: 'Projeto não encontrado.' }, { status: 404 });
  }

  const briefing = parsed.data.briefing || projectToBriefing(project);
  const updatedBriefing = {
    ...briefing,
    observacoes: `${briefing.observacoes}\nAlteração solicitada: ${parsed.data.message}`,
  };
  createOrUpdateProject(id, updatedBriefing);

  const previousContext = JSON.stringify(getVersions(id).at(-1)?.briefingJson || briefing);
  const images = [];
  const prompts = [];

  for (let index = 0; index < viewTypes.length; index += 1) {
    const view = viewTypes[index];
    const prompt = `${buildImagePrompt(updatedBriefing, view.prompt, previousContext)}
Alterar apenas o seguinte item solicitado pelo cliente: ${parsed.data.message}.
Preservar todo o restante do projeto.`;
    prompts.push(prompt);
    const generated = await generateImageDataUrl(`${prompt}\n\nNegative prompt: ${negativePrompt}`);
    images.push(
      createProjectImage({
        type: view.key as ProjectImageType,
        imageUrl: generated || fallbackImages[index % fallbackImages.length],
        prompt,
      }),
    );
  }

  const version = addProjectVersion({
    projectId: id,
    userRequest: parsed.data.message,
    briefingJson: updatedBriefing,
    imagePrompt: prompts[0],
    negativePrompt,
    imagesJson: images,
  });

  return NextResponse.json({ projectId: id, version, images: version.imagesJson });
}
