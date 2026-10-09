import assert from 'node:assert/strict';
import test from 'node:test';
import { isValueQuestion, sanitizeAiResponse, specialistPricingResponse } from '../lib/ai/sanitize';

test('sanitizeAiResponse removes explicit prices and commercial terms', () => {
  const unsafe = 'O valor fica R$ 3.500, temos desconto especial e prazo de 15 dias.';
  const sanitized = sanitizeAiResponse(unsafe);

  assert.equal(sanitized.includes('R$'), false);
  assert.equal(/desconto/i.test(sanitized), false);
  assert.equal(/prazo/i.test(sanitized), false);
});

test('isValueQuestion detects budget and price requests', () => {
  assert.equal(isValueQuestion('Quanto custa uma bancada em marmore?'), true);
  assert.equal(isValueQuestion('Pode estimar o orcamento por m2?'), true);
  assert.equal(isValueQuestion('Qual o prazo desse banheiro?'), true);
  assert.equal(isValueQuestion('Quero uma cozinha moderna com ilha'), false);
  assert.equal(isValueQuestion('A bancada tem uns 3 m2'), false);
});

test('pricing response sends the customer to a specialist', () => {
  assert.match(specialistPricingResponse, /especialista/i);
  assert.equal(/R\$|\d+\s*reais/i.test(specialistPricingResponse), false);
});
