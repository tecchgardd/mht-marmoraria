import { sitePhotos } from '../content/defaults';
import { generateImageUrl } from './openai';
import { buildImagePrompt, negativePrompt, viewTypes } from './prompts';
import type { Briefing, ProjectImageType } from './types';

/**
 * Generates every view of the project in parallel.
 * Without OpenAI (or if a generation fails) a real project photo is used as placeholder.
 */
export async function renderPreviewViews(briefing: Briefing, previousContext: string, extraInstruction = '') {
  return Promise.all(
    viewTypes.map(async (view, index) => {
      const prompt = `${buildImagePrompt(briefing, view.prompt, previousContext)}${extraInstruction ? `\n${extraInstruction}` : ''}`;
      let imageUrl: string | null = null;
      try {
        imageUrl = await generateImageUrl(`${prompt}\n\nNegative prompt: ${negativePrompt}`);
      } catch (error) {
        console.error(`Falha ao gerar a vista ${view.key}:`, error);
      }
      return {
        type: view.key as ProjectImageType,
        imageUrl: imageUrl || sitePhotos[index % sitePhotos.length],
        prompt,
      };
    }),
  );
}
