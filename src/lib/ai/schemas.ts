import { z } from 'zod';

export const briefingSchema = z.object({
  ambiente: z.string().default(''),
  estilo: z.string().default(''),
  pedra: z.string().default(''),
  coresMoveis: z.string().default(''),
  bancada: z.string().default(''),
  pia: z.string().default(''),
  iluminacao: z.string().default(''),
  medidasAproximadas: z.string().default(''),
  referencias: z.string().default(''),
  observacoes: z.string().default(''),
});

export const chatRequestSchema = z.object({
  projectId: z.string().optional(),
  message: z.string().min(1).max(2500),
});

export const generatePreviewSchema = z.object({
  projectId: z.string().optional(),
  briefing: briefingSchema,
  userRequest: z.string().optional().default('Gerar primeira prévia visual.'),
});

export const refineRequestSchema = z.object({
  message: z.string().min(1).max(2500),
  briefing: briefingSchema.optional(),
});

export const sendToSpecialistSchema = z.object({
  customerName: z.string().min(2).max(120),
  customerWhatsapp: z.string().min(8).max(40),
  message: z.string().min(1).max(2000),
});
