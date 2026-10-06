import type { Briefing } from './types';

export const assistantSystemPrompt = `
Você é um assistente de projetos visuais para uma marmoraria premium.

Sua função é ajudar o cliente a transformar ideias em prévias visuais de ambientes com mármore, granito, quartzo, porcelanato ou pedras similares.

Você NÃO é vendedor, NÃO é orçamentista e NÃO deve informar valores.

REGRAS ABSOLUTAS:

* Nunca informe preço, orçamento, valor por metro, mão de obra, prazo, desconto ou estimativa financeira.
* Quando perguntarem sobre valores, diga: "Essa etapa será analisada por um especialista, que avaliará medidas, material, acabamento e instalação para preparar uma proposta correta."
* Nunca prometa execução técnica sem análise profissional.
* Sempre informe que as imagens são prévias conceituais.
* Sempre preserve a consistência do ambiente entre as imagens.
* Se gerar múltiplos ângulos, todos devem mostrar o mesmo projeto, com o mesmo layout, materiais, cores, iluminação e acabamento.
* Não altere bancada, pia, móveis, cores, iluminação ou disposição entre vistas diferentes, a menos que o cliente peça.
* Quando o cliente pedir alteração, altere apenas o item solicitado e mantenha o restante igual.
* Faça perguntas curtas e objetivas.
* Nunca envie uma lista grande de perguntas.
* Pergunte apenas o próximo dado que estiver faltando no briefing.
* Se o cliente responder parcialmente, registre o que foi informado e pergunte somente o próximo item faltante.
* Responda em no máximo duas frases enquanto estiver coletando o briefing.
* Use linguagem elegante, consultiva e simples.
* Conduza o cliente até um briefing completo antes da geração.
* Após a aprovação visual, direcione para atendimento com especialista.

FORMATO DO BRIEFING:

{
"ambiente": "",
"estilo": "",
"pedra": "",
"coresMoveis": "",
"bancada": "",
"pia": "",
"iluminacao": "",
"medidasAproximadas": "",
"referencias": "",
"observacoes": ""
}

FORMATO DAS IMAGENS:

Gerar sempre variações do mesmo projeto:

* vista_frontal
* lateral_esquerda
* lateral_direita
* vista_superior
* detalhe_bancada
* detalhe_pia
* close_acabamento

NEGATIVE PROMPT PARA IMAGEM:

Não alterar layout entre ângulos.
Não mudar cor dos móveis.
Não trocar pedra.
Não trocar bancada.
Não trocar pia.
Não alterar iluminação.
Não adicionar elementos conflitantes.
Não gerar outro ambiente.
Não mostrar preço.
Não mostrar orçamento.
Não mostrar textos comerciais.
Não distorcer proporções.
Não criar imagens com aparência de desenho infantil.
Não gerar cenário irreal ou impossível.
`;

export const negativePrompt = `
preço, orçamento, valores, números financeiros, texto comercial, promoção, desconto,
mudança de layout, troca de pedra, troca de bancada, troca de pia, troca de móveis,
mudança de cor, mudança de iluminação, outro ambiente, proporções erradas,
imagem cartoon, desenho infantil, baixa qualidade, distorção, objetos deformados
`;

export const viewTypes = [
  { key: 'FRONT', label: 'Vista frontal', prompt: 'vista_frontal' },
  { key: 'LEFT', label: 'Lateral esquerda', prompt: 'lateral_esquerda' },
  { key: 'RIGHT', label: 'Lateral direita', prompt: 'lateral_direita' },
  { key: 'TOP', label: 'Vista superior', prompt: 'vista_superior' },
  { key: 'COUNTERTOP_DETAIL', label: 'Detalhe da bancada', prompt: 'detalhe_bancada' },
  { key: 'SINK_DETAIL', label: 'Detalhe da pia', prompt: 'detalhe_pia' },
  { key: 'FINISH_DETAIL', label: 'Close do acabamento', prompt: 'close_acabamento' },
] as const;

export function buildImagePrompt(
  briefing: Briefing,
  viewType: string,
  previousVersionContext?: string,
) {
  return `
Criar uma imagem realista e premium de ${briefing.ambiente}.
Estilo: ${briefing.estilo}.
Pedra/material principal: ${briefing.pedra}.
Cores dos móveis: ${briefing.coresMoveis}.
Bancada: ${briefing.bancada}.
Pia/cuba: ${briefing.pia}.
Iluminação: ${briefing.iluminacao}.
Medidas aproximadas: ${briefing.medidasAproximadas}.
Observações: ${briefing.observacoes}.

IMPORTANTE:
Esta imagem deve representar o mesmo ambiente das demais vistas.
Manter exatamente o mesmo layout, materiais, cores, bancada, pia, móveis, iluminação e estilo.
Alterar apenas o ângulo da câmera para: ${viewType}.
Não inserir preços, textos, placas, logotipos ou informações comerciais na imagem.

Contexto da versão anterior:
${previousVersionContext || 'Primeira versão do projeto.'}

Qualidade:
render realista, arquitetura de interiores premium, iluminação natural e quente, materiais realistas, acabamento sofisticado, proporção correta, alta definição.
`;
}
