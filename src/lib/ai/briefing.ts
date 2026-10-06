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

export function mergeBriefing(current: Briefing, message: string): Briefing {
  const lower = message.toLowerCase();
  const next = { ...current };

  if (!next.ambiente) {
    if (lower.includes('cozinha')) next.ambiente = 'Cozinha';
    if (lower.includes('banheiro') || lower.includes('lavabo')) next.ambiente = 'Banheiro';
    if (lower.includes('gourmet') || lower.includes('churrasqueira')) next.ambiente = 'Área gourmet';
    if (lower.includes('escada')) next.ambiente = 'Escada';
  }

  if (!next.estilo) {
    if (lower.includes('moderno')) next.estilo = 'Moderno premium';
    if (lower.includes('clássico') || lower.includes('classico')) next.estilo = 'Clássico sofisticado';
    if (lower.includes('minimalista')) next.estilo = 'Minimalista elegante';
  }

  if (!next.pedra) {
    if (lower.includes('mármore') || lower.includes('marmore')) next.pedra = 'Mármore';
    if (lower.includes('granito')) next.pedra = 'Granito';
    if (lower.includes('quartzo')) next.pedra = 'Quartzo';
    if (lower.includes('travertino')) next.pedra = 'Travertino';
  }

  if (!next.coresMoveis && /(branco|preto|cinza|amadeirado|madeira|bege|verde)/i.test(message)) {
    next.coresMoveis = message;
  }
  if (!next.bancada && /(ilha|bancada|balcão|balcao)/i.test(message)) {
    next.bancada = message;
  }
  if (!next.pia && /(pia|cuba|esculpida|dupla)/i.test(message)) {
    next.pia = message;
  }
  if (!next.iluminacao && /(luz|iluminação|iluminacao|led|pendente|quente)/i.test(message)) {
    next.iluminacao = message;
  }
  if (!next.medidasAproximadas && /(\d+\s?m|\d+,\d+|\d+\.\d+)/i.test(message)) {
    next.medidasAproximadas = message;
  }

  next.observacoes = next.observacoes ? `${next.observacoes}\n${message}` : message;
  return next;
}

export function isBriefingReady(briefing: Briefing) {
  return Boolean(
    briefing.ambiente &&
      briefing.estilo &&
      briefing.pedra &&
      briefing.coresMoveis &&
      briefing.bancada &&
      briefing.pia &&
      briefing.iluminacao,
  );
}

const requiredBriefingFields: Array<[keyof Briefing, string]> = [
  ['ambiente', 'Qual ambiente você deseja projetar?'],
  ['pedra', 'Qual pedra ou material você quer usar? Pode ser granito, mármore, quartzo ou outro.'],
  ['estilo', 'Qual estilo você prefere para esse ambiente? Moderno, minimalista, clássico ou outro?'],
  ['coresMoveis', 'Quais cores você quer nos móveis e metais?'],
  ['bancada', 'Como você imagina a bancada? Reta, em L, com nicho, pequena, grande ou outro formato?'],
  ['pia', 'Qual tipo de pia ou cuba você prefere? Embutida, de apoio, esculpida, dupla ou simples?'],
  ['iluminacao', 'Como você quer a iluminação? LED quente, luz branca, pendentes, spots ou outra opção?'],
];

export function getNextBriefingQuestion(briefing: Briefing) {
  const missingField = requiredBriefingFields.find(([field]) => !briefing[field]);
  return missingField?.[1] || '';
}
