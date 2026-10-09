import { briefingFieldLabels, isStairs, NOT_APPLICABLE } from './briefing';
import type { Briefing, ProjectImageType } from './types';

const commonRules = `
ESCOPO
* Você só trata de projetos de ambientes com pedra: mármore, granito, quartzo, porcelanato, travertino e similares.
* Nunca fale de preço, orçamento, valor por metro, mão de obra, prazo, desconto ou pagamento.
* Nunca prometa viabilidade técnica. As imagens são prévias conceituais.
* Nunca invente detalhes (cores, acabamentos, objetos) que o cliente não disse.
`;

export const briefingSystemPrompt = `
Você é o assistente de projetos da MHT Marmoraria. Sua tarefa é EXTRAIR da mensagem do cliente os dados do briefing para gerar prévias visuais do projeto dele.
${commonRules}
CAMPOS
* ambiente: cozinha, banheiro, lavabo, área gourmet, escada, lavanderia...
* pedra: material e, se o cliente disser, cor/nome. Ex.: "mármore claro", "granito preto São Gabriel", "quartzo branco".
* estilo: moderno, minimalista, clássico, rústico...
* coresMoveis: cor dos móveis e dos metais (em escada: corrimão e paredes).
* bancada: formato. Ex.: reta, suspensa, em L, ilha, com nicho.
* pia: tipo de cuba. Ex.: embutida, de apoio, esculpida na pedra; simples ou dupla.
* iluminacao: luz quente, luz branca, pendentes, spots, LED nos degraus...
* medidasAproximadas, referencias, observacoes: só se o cliente citar.

COMO EXTRAIR
* Leia a mensagem inteira e registre TODOS os campos que ela menciona, mesmo dentro de outra frase.
  Ex.: "Banheiro com cuba esculpida em mármore claro e iluminação quente" ->
  {"ambiente": "Banheiro", "pedra": "Mármore claro", "pia": "Cuba esculpida na pedra", "iluminacao": "Luz quente"}.
* Se a mensagem responde ao "campo pendente", registre a resposta nesse campo.
* Resposta vaga ("tanto faz", "você escolhe"): registre a opção mais comum para o ambiente.
* Use as palavras do cliente, de forma curta. Não enfeite e não deduza o que ele não disse.
* Não altere campos já preenchidos, a menos que o cliente peça claramente.
* Detalhes que não cabem em nenhum campo (ex.: "com nicho para shampoo", "rodapé em pedra") vão para observacoes, somados ao texto anterior.

AVISO
* "aviso" fica vazio na maioria das vezes.
* Se o cliente perguntar sobre preço/prazo: "Valores e prazos são definidos por um especialista após analisar medidas, material e instalação."
* Se falar de assunto fora de projetos com pedra: 1 frase curta dizendo que você só ajuda com o projeto.

SAÍDA
Responda APENAS com JSON válido, sem texto fora dele:
{"briefing": {<somente os campos que mudaram nesta mensagem>}, "aviso": ""}
`;

export const refineSystemPrompt = `
Você é o assistente de projetos da MHT Marmoraria. O projeto já tem prévias geradas e o cliente está pedindo um ajuste.
${commonRules}
* Pedido sobre valores: acao "perguntar", "alteracoes" vazio, resposta "Valores e prazos são definidos por um especialista após analisar medidas, material e instalação."
* Pedido fora do projeto: acao "perguntar", "alteracoes" vazio, 1 frase dizendo que você só ajuda com o projeto.

COMO AJUSTAR
* Identifique exatamente quais campos do briefing o pedido altera. Altere só esses; o resto do projeto fica igual.
* Pedido claro: acao "ajustar". Em "alteracoes", envie apenas os campos alterados, com o valor final completo do campo.
  Ex.: bancada "Ilha central" + pedido "coloca um cooktop na ilha" -> {"bancada": "Ilha central com cooktop"}.
* Pedido vago (ex.: "deixa mais bonito", "troca a pedra" sem dizer qual): acao "perguntar", "alteracoes" vazio, e faça UMA pergunta com 2 a 4 opções.
  Ex.: "Para qual pedra você quer trocar: quartzo branco, mármore Carrara ou granito preto?"
* Detalhe que não cabe em nenhum campo: coloque em observacoes, mantendo o texto anterior e acrescentando o novo.
* "resposta" quando ajustar: 1 frase dizendo o que muda e que o resto será mantido. Ex.: "Vou trocar a pedra para quartzo branco e manter o restante do projeto."
* No máximo 2 frases curtas. Português simples e cordial.

Campos válidos: ambiente, estilo, pedra, coresMoveis, bancada, pia, iluminacao, medidasAproximadas, referencias, observacoes.

SAÍDA
Responda APENAS com JSON válido, sem texto fora dele:
{"acao": "ajustar" | "perguntar", "alteracoes": {<campos alterados>}, "resposta": "<texto para o cliente>"}
`;

export const negativePrompt =
  'cartoon, illustration, CGI or 3D-render look, people, text, letters, logos, watermark, prices, distorted or melting objects, ' +
  'impossible geometry, wrong proportions, elements the client did not ask for (fireplace, extra furniture, clutter, construction debris), ' +
  'unfinished construction site, messy room.';

export type ViewType = { key: ProjectImageType; label: string };

/** Views rendered for each version. The first is generated from text; the others are derived from it. */
export function getViewTypes(briefing: Briefing): ViewType[] {
  if (isStairs(briefing.ambiente)) {
    return [
      { key: 'FRONT', label: 'Vista frontal' },
      { key: 'LEFT', label: 'Vista em perspectiva' },
      { key: 'TOP', label: 'Vista de cima' },
      { key: 'FINISH_DETAIL', label: 'Detalhe do acabamento' },
    ];
  }
  return [
    { key: 'FRONT', label: 'Vista frontal' },
    { key: 'LEFT', label: 'Vista em perspectiva' },
    { key: 'COUNTERTOP_DETAIL', label: 'Detalhe da bancada' },
    briefing.pia && briefing.pia !== NOT_APPLICABLE
      ? { key: 'SINK_DETAIL', label: 'Detalhe da cuba' }
      : { key: 'FINISH_DETAIL', label: 'Detalhe do acabamento' },
  ];
}

function briefingLines(briefing: Briefing) {
  return (Object.keys(briefingFieldLabels) as Array<keyof Briefing>)
    .filter((field) => briefing[field] && briefing[field] !== NOT_APPLICABLE)
    .map((field) => `- ${briefingFieldLabels[field]}: ${briefing[field]}`)
    .join('\n');
}

const realismRules = `
Rules:
- Depict EXACTLY the client's specification above, literally. Do not add anything they did not ask for and do not change what they asked for.
- Only a few discreet objects that naturally belong in this room are allowed (e.g. a towel, a soap dispenser). No unrelated furniture.
- It must be a real, buildable project a marble and granite workshop (marmoraria) could fabricate and install: real stone slabs with natural veining,
  2-3 cm thick visible edges, believable joints, standard residential heights and dimensions, correct scale.
- The stone is the protagonist: accurate color and veining for the material named by the client.
- Finished, clean, furnished room; professional interior architecture photography, natural light balanced with the requested lighting,
  sharp focus, true-to-life colors, no people, no text, no logos, no watermark.
Avoid: ${negativePrompt}`;

/** Main view, generated from text. */
export function buildImagePrompt(briefing: Briefing) {
  return `Photorealistic photograph of a real Brazilian residential ${briefing.ambiente} project, designed and built in natural stone.
Client's specification (written in Portuguese, follow it literally):
${briefingLines(briefing)}

Camera: eye level, straight-on front view of the main stone piece${isStairs(briefing.ambiente) ? ' (the staircase)' : ' (the countertop/vanity)'}, 24 mm lens, whole composition visible.
${realismRules}`;
}

const viewInstructions: Record<ProjectImageType, string> = {
  FRONT: 'eye-level front view of the main stone piece, whole composition visible',
  LEFT: 'a three-quarter perspective from about 45 degrees to the left, showing depth and the side of the stone piece',
  RIGHT: 'a three-quarter perspective from about 45 degrees to the right',
  TOP: 'a high-angle view from above, looking down on the stone surfaces',
  COUNTERTOP_DETAIL: 'a close-up of the countertop: the edge profile, slab thickness and stone veining',
  SINK_DETAIL: 'a close-up of the sink/basin and faucet and how they meet the stone',
  FINISH_DETAIL: 'a close-up of the stone finish: edges, joints and surface texture',
};

/** Other views, derived from the main image so every view shows the same project. */
export function buildViewPrompt(briefing: Briefing, view: ProjectImageType) {
  return `The attached image is the client's approved ${briefing.ambiente} project. Produce a new photograph of this SAME room, same project, taken as ${viewInstructions[view]}.
Keep everything identical: the same stone (color and veining), countertop shape, sink, faucet, cabinets, walls, floor, lighting and decor.
Do not add, remove or redesign anything; only the camera position changes.
Client's specification, for reference:
${briefingLines(briefing)}
${realismRules}`;
}

/** Applies a client's adjustment on top of the previous main image. */
export function buildRefinePrompt(briefing: Briefing, change: string) {
  return `The attached image is the client's current ${briefing.ambiente} project. Apply ONLY this change: ${change}.
Keep everything else exactly the same: camera angle, layout, dimensions, and every element the change does not mention.
Updated client's specification (Portuguese):
${briefingLines(briefing)}
${realismRules}`;
}
