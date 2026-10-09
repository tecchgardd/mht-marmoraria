import type { Briefing } from './types';

export const emptyBriefing: Briefing = {
  ambiente: '',
  estilo: '',
  pedra: '',
  coresMoveis: '',
  bancada: '',
  pia: '',
  iluminacao: '',
  medidasAproximadas: '',
  referencias: '',
  observacoes: '',
};

export const briefingFieldLabels: Record<keyof Briefing, string> = {
  ambiente: 'ambiente',
  estilo: 'estilo',
  pedra: 'pedra/material',
  coresMoveis: 'cores dos móveis e metais',
  bancada: 'formato da bancada',
  pia: 'tipo de pia/cuba',
  iluminacao: 'iluminação',
  medidasAproximadas: 'medidas aproximadas',
  referencias: 'referências',
  observacoes: 'observações',
};

export const NOT_APPLICABLE = 'Não se aplica';

const isBathroom = (ambiente: string) => /banheiro|lavabo/.test(ambiente);
const isKitchen = (ambiente: string) => /cozinha|gourmet|churrasqueira/.test(ambiente);
export const isStairs = (ambiente: string) => /escada/i.test(ambiente);

type Question = (ambiente: string) => string;

// Required fields in the order they are asked. Options depend on the room, so a bathroom is never offered an island.
const requiredBriefingFields: Array<[keyof Briefing, Question]> = [
  ['ambiente', () => 'Qual ambiente você quer projetar: cozinha, banheiro, área gourmet ou escada?'],
  ['pedra', () => 'Qual pedra você quer usar: mármore, granito ou quartzo? Se souber a cor ou o nome, pode dizer.'],
  ['estilo', () => 'Qual estilo você prefere: moderno, minimalista ou clássico?'],
  [
    'coresMoveis',
    (ambiente) =>
      isStairs(ambiente)
        ? 'Qual a cor do corrimão e das paredes ao redor da escada?'
        : 'Qual a cor dos móveis e dos metais (torneira, puxadores)?',
  ],
  [
    'bancada',
    (ambiente) =>
      isBathroom(ambiente)
        ? 'Qual o formato da bancada: reta, suspensa ou com nicho?'
        : 'Qual o formato da bancada: reta, em L ou com ilha?',
  ],
  [
    'pia',
    (ambiente) =>
      isKitchen(ambiente)
        ? 'Qual tipo de cuba: embutida, sobreposta ou esculpida na pedra? Simples ou dupla?'
        : 'Qual tipo de cuba: de apoio, embutida ou esculpida na pedra?',
  ],
  [
    'iluminacao',
    (ambiente) =>
      isStairs(ambiente)
        ? 'Qual iluminação você prefere: LED nos degraus, arandelas ou luz natural?'
        : 'Qual iluminação você prefere: luz quente, luz branca ou pendentes?',
  ],
];

const environmentKeywords: Array<[RegExp, string]> = [
  [/cozinha/, 'Cozinha'],
  [/banheiro/, 'Banheiro'],
  [/lavabo/, 'Lavabo'],
  [/gourmet|churrasqueira/, 'Área gourmet'],
  [/escada/, 'Escada'],
  [/lavanderia/, 'Lavanderia'],
];

const styleKeywords: Array<[RegExp, string]> = [
  [/modern/, 'Moderno'],
  [/minimalist/, 'Minimalista'],
  [/cl[aá]ssic/, 'Clássico'],
  [/r[uú]stic/, 'Rústico'],
];

const stoneKeywords: Array<[RegExp, string]> = [
  [/m[aá]rmore/, 'Mármore'],
  [/granito/, 'Granito'],
  [/quartzo/, 'Quartzo'],
  [/travertino/, 'Travertino'],
  [/porcelanato/, 'Porcelanato'],
];

function matchKeyword(text: string, keywords: Array<[RegExp, string]>) {
  return keywords.find(([pattern]) => pattern.test(text))?.[1] || '';
}

// Fields that do not exist in the chosen room are filled so they are never asked.
export function normalizeBriefing(briefing: Briefing): Briefing {
  if (!isStairs(briefing.ambiente)) return briefing;
  return { ...briefing, bancada: briefing.bancada || NOT_APPLICABLE, pia: briefing.pia || NOT_APPLICABLE };
}

export function getPendingField(briefing: Briefing) {
  return requiredBriefingFields.find(([field]) => !briefing[field])?.[0];
}

// Fallback used when the AI is unavailable: fills the field being asked, without spreading the message across fields.
export function mergeBriefing(current: Briefing, message: string): Briefing {
  const lower = message.toLowerCase();
  const next = { ...current };
  const pending = getPendingField(current);

  if (!next.ambiente) next.ambiente = matchKeyword(lower, environmentKeywords);
  if (!next.pedra && matchKeyword(lower, stoneKeywords)) next.pedra = message.trim();
  if (!next.estilo) next.estilo = matchKeyword(lower, styleKeywords);
  if (!next.medidasAproximadas && /\d+([.,]\d+)?\s?(m|cm)\b/i.test(message)) {
    next.medidasAproximadas = message.trim();
  }

  // The answer to the pending question goes only to that field.
  if (pending && pending !== 'ambiente' && !next[pending]) {
    next[pending] = message.trim();
  }

  return normalizeBriefing(next);
}

export function isBriefingReady(briefing: Briefing) {
  return requiredBriefingFields.every(([field]) => Boolean(briefing[field]));
}

export function getNextBriefingQuestion(briefing: Briefing) {
  const pending = getPendingField(briefing);
  const question = requiredBriefingFields.find(([field]) => field === pending)?.[1];
  return question ? question(briefing.ambiente.toLowerCase()) : '';
}
