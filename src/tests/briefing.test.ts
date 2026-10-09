import assert from 'node:assert/strict';
import test from 'node:test';
import { emptyBriefing, getNextBriefingQuestion, isBriefingReady, mergeBriefing, NOT_APPLICABLE } from '../lib/ai/briefing';

test('mergeBriefing fills only the pending field with the answer', () => {
  const briefing = mergeBriefing({ ...emptyBriefing, ambiente: 'Cozinha' }, 'mármore branco');

  assert.equal(briefing.pedra, 'mármore branco');
  assert.equal(briefing.coresMoveis, '');
  assert.equal(briefing.observacoes, '');
});

test('questions follow the fixed order and offer options', () => {
  assert.match(getNextBriefingQuestion(emptyBriefing), /ambiente.*cozinha/i);
  assert.match(getNextBriefingQuestion({ ...emptyBriefing, ambiente: 'Cozinha' }), /pedra/i);
});

test('briefing is ready only with all required fields', () => {
  const partial = { ...emptyBriefing, ambiente: 'Cozinha', pedra: 'Quartzo', estilo: 'Moderno' };
  assert.equal(isBriefingReady(partial), false);
  assert.equal(
    isBriefingReady({
      ...partial,
      coresMoveis: 'Preto',
      bancada: 'Ilha',
      pia: 'Embutida',
      iluminacao: 'LED quente',
    }),
    true,
  );
});

test('questions offer options that fit the room', () => {
  const bathroom = { ...emptyBriefing, ambiente: 'Banheiro', pedra: 'Mármore claro', estilo: 'Moderno', coresMoveis: 'Branco' };
  assert.doesNotMatch(getNextBriefingQuestion(bathroom), /ilha/i);
});

test('stairs never ask for countertop or sink', () => {
  const stairs = mergeBriefing({ ...emptyBriefing, ambiente: 'Escada', pedra: 'Travertino', estilo: 'Clássico' }, 'corrimão preto');
  assert.equal(stairs.bancada, NOT_APPLICABLE);
  assert.equal(stairs.pia, NOT_APPLICABLE);
  assert.match(getNextBriefingQuestion(stairs), /iluminação/i);
});
