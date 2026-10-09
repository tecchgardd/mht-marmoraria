import OpenAI from 'openai';
import type { Briefing } from './types';
import { briefingFieldLabels, getPendingField, isBriefingReady } from './briefing';
import { briefingSystemPrompt, refineSystemPrompt } from './prompts';
import { sanitizeAiResponse } from './sanitize';
import { uploadDataUrl } from '../cloudinary';

const briefingKeys = Object.keys(briefingFieldLabels) as Array<keyof Briefing>;

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

async function askJson(client: OpenAI, systemPrompt: string, userContent: string) {
  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userContent },
    ],
    temperature: 0.2,
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

  const nextBriefing = { ...briefing, ...pickBriefingChanges(result.briefing) };
  const response = typeof result.resposta === 'string' ? sanitizeAiResponse(result.resposta) : '';

  return {
    briefing: nextBriefing,
    response: response || (isBriefingReady(nextBriefing) ? 'Perfeito, vou gerar as prévias conceituais.' : ''),
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

// Returns a Cloudinary URL (or a data URL when Cloudinary is not configured), or null without OpenAI.
export async function generateImageUrl(prompt: string) {
  const client = getOpenAIClient();
  if (!client) return null;

  const result = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
  });

  const base64 = result.data?.[0]?.b64_json;
  if (!base64) return null;

  const dataUrl = `data:image/png;base64,${base64}`;
  return (await uploadDataUrl(dataUrl, 'previas-ia')) || dataUrl;
}
