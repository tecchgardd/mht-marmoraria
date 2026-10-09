import { z } from 'zod';

export const SERVICE_OPTIONS = ['Bancada', 'Pia / cuba', 'Revestimento', 'Escada', 'Soleira / peitoril', 'Outro'] as const;
export const STONE_OPTIONS = ['Granito', 'Mármore', 'Quartzo', 'Porcelanato', 'Ultracompacto', 'Ainda não sei'] as const;
export const COLOR_OPTIONS = ['Branco', 'Preto', 'Cinza', 'Bege', 'Verde', 'Ainda não sei'] as const;

const optional = (max: number) => z.string().trim().max(max).default('');

export const quoteRequestSchema = z
  .object({
    services: z.array(z.string().trim().min(1).max(40)).min(1, 'Escolha pelo menos um serviço.').max(6),
    hasMeasurements: z.boolean(),
    measurements: optional(200),
    stoneType: optional(60),
    stoneColor: optional(60),
    name: z.string().trim().min(2, 'Informe seu nome.').max(120),
    phone: z
      .string()
      .trim()
      .max(30)
      .refine((value) => value.replace(/\D/g, '').length >= 10, 'Informe um telefone com DDD.'),
    email: z.union([z.literal(''), z.string().trim().email('E-mail inválido.').max(120)]).default(''),
    address: optional(200),
    city: optional(80),
    notes: optional(1000),
    topic: optional(120),
    // Honeypot: real visitors never fill this hidden field.
    website: z.string().max(0).optional(),
  })
  .refine((data) => !data.hasMeasurements || data.measurements.length > 0, {
    message: 'Informe a metragem ou marque que ainda não sabe.',
    path: ['measurements'],
  });

export type QuoteRequestInput = z.infer<typeof quoteRequestSchema>;

/** WhatsApp message with the request organised by topic. */
export function buildQuoteMessage(quote: QuoteRequestInput) {
  const stone = [quote.stoneType, quote.stoneColor && `cor ${quote.stoneColor.toLowerCase()}`].filter(Boolean).join(', ');
  const lines = [
    'Olá! Gostaria de um orçamento.',
    '',
    `*Serviço:* ${quote.services.join(', ')}`,
    quote.topic && `*Interesse:* ${quote.topic}`,
    `*Metragem:* ${quote.hasMeasurements ? quote.measurements : 'Ainda não sei, preciso de medição'}`,
    stone && `*Pedra:* ${stone}`,
    quote.notes && `*Observações:* ${quote.notes}`,
    '',
    `*Nome:* ${quote.name}`,
    `*Telefone:* ${quote.phone}`,
    quote.email && `*E-mail:* ${quote.email}`,
    (quote.address || quote.city) && `*Endereço da obra:* ${[quote.address, quote.city].filter(Boolean).join(' - ')}`,
  ];
  return lines.filter((line): line is string => typeof line === 'string').join('\n');
}

/** (48) 99999-9999 while typing. */
export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}
