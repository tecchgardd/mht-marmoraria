import OpenAI, { toFile } from 'openai';
import type { Briefing } from './types';
import { briefingFieldLabels, getNextBriefingQuestion, getPendingField, isBriefingReady, normalizeBriefing } from './briefing';
import { briefingSystemPrompt, refineSystemPrompt } from './prompts';
import { sanitizeAiResponse } from './sanitize';
import { uploadDataUrl } from '../cloudinary';

const briefingKeys = Object.keys(briefingFieldLabels) as Array<keyof Briefing>;

const chatModel = process.env.OPENAI_CHAT_MODEL || 'gpt-5.4-mini';
const imageModel = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function askJson(client: OpenAI, systemPrompt: string, userContent: string) {
  // Reasoning models (gpt-5.x) reject a custom temperature.
  const tuning = chatModel.startsWith('gpt-5') ? { reasoning_effort: 'low' as const } : { temperature: 0.2 };
  const completion = await client.chat.completions.create({
    model: chatModel,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    ...tuning,
    response_format: { type: 'json_object' },
  });

  try {
    return JSON.parse(completion.choices[0]?.message?.content || '') as Record<string, unknown>;
  } catch {
    return null;
  }
}

// Keeps only known briefing fields with non-empty string values.
function pickBriefingChanges(value: unknown): Partial<Briefing> {
  if (!value || typeof value !== 'object') return {};
  const changes: Partial<Briefing> = {};
  for (const key of briefingKeys) {
    const field = (value as Record<string, unknown>)[key];
    if (typeof field === 'string' && field.trim()) changes[key] = field.trim();
  }
  return changes;
}

export type BriefingTurn = {
  briefing: Briefing;
  response: string;
};

// The AI only extracts data; the next question comes from the fixed list so no field is skipped or invented.
export async function runBriefingTurn(message: string, briefing: Briefing): Promise<BriefingTurn | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  const pending = getPendingField(briefing);
  const result = await askJson(
    client,
    briefingSystemPrompt,
    [
      `Briefing atual: ${JSON.stringify(briefing)}`,
      `Campo pendente: ${pending ? `${pending} (${briefingFieldLabels[pending]})` : 'nenhum, briefing completo'}`,
      `Mensagem do cliente: ${message}`,
    ].join('\n'),
  );
  if (!result) return null;

  const nextBriefing = normalizeBriefing({ ...briefing, ...pickBriefingChanges(result.briefing) });
  const notice = typeof result.aviso === 'string' ? sanitizeAiResponse(result.aviso) : '';
  const next = isBriefingReady(nextBriefing)
    ? 'Perfeito, vou gerar as prévias do seu projeto.'
    : getNextBriefingQuestion(nextBriefing);

  return {
    briefing: nextBriefing,
    response: [notice, next].filter(Boolean).join('\n\n'),
  };
}

export type RefineDecision =
  | { action: 'adjust'; changes: Partial<Briefing>; response: string }
  | { action: 'ask'; response: string };

export async function interpretRefinement(message: string, briefing: Briefing): Promise<RefineDecision | null> {
  const client = getOpenAIClient();
  if (!client) return null;

  const result = await askJson(
    client,
    refineSystemPrompt,
    `Briefing atual: ${JSON.stringify(briefing)}\nPedido do cliente: ${message}`,
  );
  if (!result) return null;

  const response = typeof result.resposta === 'string' ? sanitizeAiResponse(result.resposta) : '';
  const changes = pickBriefingChanges(result.alteracoes);

  if (result.acao === 'ajustar' && Object.keys(changes).length > 0) {
    return {
      action: 'adjust',
      changes,
      response: response || 'Vou aplicar o ajuste e manter o restante do projeto.',
    };
  }

  return {
    action: 'ask',
    response: response || 'Pode me dizer exatamente o que você quer mudar: pedra, bancada, pia, cores ou iluminação?',
  };
}

const imageOptions = {
  size: '1536x1024',
  quality: 'medium',
  output_format: 'webp',
  output_compression: 85,
} as const;

function firstImage(result: OpenAI.ImagesResponse) {
  const base64 = result.data?.[0]?.b64_json;
  if (!base64) throw new Error('A OpenAI não retornou imagem.');
  return Buffer.from(base64, 'base64');
}

/** Generates an image from text. */
export async function generateImage(client: OpenAI, prompt: string) {
  return firstImage(await client.images.generate({ model: imageModel, prompt, ...imageOptions }));
}

/** Generates an image using another one as reference, keeping the same project. */
export async function editImage(client: OpenAI, reference: Buffer, prompt: string) {
  const image = await toFile(reference, 'referencia.webp', { type: 'image/webp' });
  return firstImage(await client.images.edit({ model: imageModel, image, prompt, ...imageOptions }));
}

/** Stores the image on Cloudinary. If it is not configured or fails, the image is kept inline so it is not lost. */
export async function storeImage(image: Buffer) {
  const dataUrl = `data:image/webp;base64,${image.toString('base64')}`;
  try {
    return (await uploadDataUrl(dataUrl, 'previas-ia')) || dataUrl;
  } catch (error) {
    console.error('Falha ao enviar prévia ao Cloudinary; guardando a imagem no banco:', error);
    return dataUrl;
  }
}

/** Reads a stored preview (Cloudinary URL or inline data URL) back so it can be used as reference. */
export async function loadImage(url: string) {
  if (url.startsWith('data:')) return Buffer.from(url.slice(url.indexOf(',') + 1), 'base64');
  if (!url.startsWith('https://')) return null;
  const response = await fetch(url);
  return response.ok ? Buffer.from(await response.arrayBuffer()) : null;
}
