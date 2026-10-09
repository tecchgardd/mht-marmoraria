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

// Required fields in the order they are asked.
const requiredBriefingFields: Array<[keyof Briefing, string]> = [
  ['ambiente', 'Qual ambiente você quer projetar: cozinha, banheiro, área gourmet ou escada?'],
  ['pedra', 'Qual pedra você quer usar: mármore, granito ou quartzo? Se souber a cor ou o nome, pode dizer.'],
  ['estilo', 'Qual estilo você prefere: moderno, minimalista ou clássico?'],
  ['coresMoveis', 'Qual a cor dos móveis e dos metais?'],
  ['bancada', 'Qual o formato da bancada: reta, em L ou ilha?'],
  ['pia', 'Qual tipo de pia: embutida, de apoio ou esculpida na pedra?'],
  ['iluminacao', 'Qual iluminação você prefere: LED quente, luz branca ou pendentes?'],
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

  return next;
}

export function isBriefingReady(briefing: Briefing) {
  return requiredBriefingFields.every(([field]) => Boolean(briefing[field]));
}

export function getNextBriefingQuestion(briefing: Briefing) {
  const pending = getPendingField(briefing);
  return requiredBriefingFields.find(([field]) => field === pending)?.[1] || '';
}
