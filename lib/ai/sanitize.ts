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
  return /(preco|preço|valor|orcamento|orçamento|quanto custa|m²|m2|metro quadrado|desconto|promocao|promoção|prazo)/i.test(
    message,
  );
}

export const specialistPricingResponse =
  'Essa etapa sera analisada por um especialista, que avaliara medidas, material, acabamento e instalacao para preparar uma proposta correta.';
