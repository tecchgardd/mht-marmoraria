const commercialPatterns = [
  /R\$\s?[\d.,]+/gi,
  /\b\d+([.,]\d+)?\s*(reais|real)\b/gi,
  /\b(valor|preco|preco|orcamento|orcamento|desconto|promocao|promocao|prazo)\b[^.!?\n]*/gi,
  /\b(valor|preço|orçamento|promoção)\b[^.!?\n]*/gi,
  /\b\d+([.,]\d+)?\s*(por|\/)\s*(m2|m²|metro quadrado)\b/gi,
  /\b(condicao de pagamento|condição de pagamento)\b[^.!?\n]*/gi,
];

export function sanitizeAiResponse(text: string) {
  let sanitized = text;
  for (const pattern of commercialPatterns) {
    sanitized = sanitized.replace(pattern, '[informacao comercial removida]');
  }
  return sanitized.trim();
}

export function isValueQuestion(message: string) {
  // Plain measures like "3 m2" are briefing data, not pricing questions.
  return /(pre[cç]o|valor|or[cç]amento|quanto (custa|fica|sai)|por m(2|²)|o m(2|²)|desconto|promo[cç][aã]o|prazo|parcel)/i.test(
    message,
  );
}

export const specialistPricingResponse =
  'Valores e prazos são definidos por um especialista após analisar medidas, material e instalação.';
