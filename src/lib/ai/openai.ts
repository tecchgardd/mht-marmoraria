import OpenAI from 'openai';
import type { Briefing } from './types';
import { assistantSystemPrompt } from './prompts';
import { sanitizeAiResponse } from './sanitize';

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) return null;
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateChatResponse(message: string, briefing: Briefing) {
  const client = getOpenAIClient();
  if (!client) {
    return fallbackChatResponse(message, briefing);
  }

  const completion = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: assistantSystemPrompt },
      {
        role: 'user',
        content: `Briefing atual: ${JSON.stringify(briefing)}\n\nMensagem do cliente: ${message}`,
      },
    ],
    temperature: 0.4,
  });

  return sanitizeAiResponse(completion.choices[0]?.message?.content || fallbackChatResponse(message, briefing));
}

export async function generateImageDataUrl(prompt: string) {
  const client = getOpenAIClient();
  if (!client) return null;

  const result = await client.images.generate({
    model: 'gpt-image-1',
    prompt,
    size: '1024x1024',
  });

  const base64 = result.data?.[0]?.b64_json;
  return base64 ? `data:image/png;base64,${base64}` : null;
}

function fallbackChatResponse(message: string, briefing: Briefing) {
  const missing = [
    ['ambiente', briefing.ambiente],
    ['estilo', briefing.estilo],
    ['pedra', briefing.pedra],
    ['cores dos móveis', briefing.coresMoveis],
    ['bancada', briefing.bancada],
    ['pia/cuba', briefing.pia],
    ['iluminação', briefing.iluminacao],
  ].filter(([, value]) => !value);

  if (missing.length > 0) {
    return `Perfeito. Para criar uma prévia conceitual consistente, me diga ${missing[0][0]} do projeto.`;
  }

  return `Ótimo, já temos uma boa base para o briefing. Posso gerar uma prévia conceitual com múltiplos ângulos mantendo o mesmo layout, materiais, cores e iluminação.`;
}
