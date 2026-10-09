import { editImage, generateImage, getOpenAIClient, loadImage, storeImage } from './openai';
import { buildImagePrompt, buildRefinePrompt, buildViewPrompt, getViewTypes } from './prompts';
import type { Briefing, ProjectImageType } from './types';

export class PreviewError extends Error {}

type RenderOptions = {
  /** Main image of the previous version, used as base when applying an adjustment. */
  previousImageUrl?: string;
  /** Description of the adjustment to apply on top of the previous image. */
  change?: string;
};

/**
 * Renders the main view first, then derives the other views from it, so every image shows the same project.
 * There is no placeholder: if the main view fails, a PreviewError is thrown instead of showing unrelated photos.
 */
export async function renderPreviewViews(briefing: Briefing, { previousImageUrl, change }: RenderOptions = {}) {
  const client = getOpenAIClient();
  if (!client) throw new PreviewError('A geração de imagens não está configurada no servidor.');

  const [mainView, ...otherViews] = getViewTypes(briefing);
  const previous = previousImageUrl && change ? await loadImage(previousImageUrl).catch(() => null) : null;
  const mainPrompt = previous && change ? buildRefinePrompt(briefing, change) : buildImagePrompt(briefing);

  let main: Buffer;
  try {
    main = previous ? await editImage(client, previous, mainPrompt) : await generateImage(client, mainPrompt);
  } catch (error) {
    console.error('Falha ao gerar a vista principal:', error);
    throw new PreviewError('Não foi possível gerar as prévias agora. Tente novamente em instantes.');
  }

  const others = await Promise.all(
    otherViews.map(async (view) => {
      const prompt = buildViewPrompt(briefing, view.key);
      try {
        return { type: view.key, image: await editImage(client, main, prompt), prompt };
      } catch (error) {
        // A missing secondary view is better than one showing a different project.
        console.error(`Falha ao gerar a vista ${view.key}:`, error);
        return null;
      }
    }),
  );

  const rendered = [{ type: mainView.key, image: main, prompt: mainPrompt }, ...others.filter((view) => view !== null)];
  return Promise.all(
    rendered.map(async (view) => ({
      type: view.type as ProjectImageType,
      imageUrl: await storeImage(view.image),
      prompt: view.prompt,
    })),
  );
}
