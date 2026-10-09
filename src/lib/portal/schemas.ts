import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Informe o e-mail.').max(120),
  password: z.string().min(1, 'Informe a senha.').max(200),
});

export const userSchema = z.object({
  email: z.string().trim().email('E-mail inválido.').max(120),
  password: z.string().min(8, 'Senha precisa ter pelo menos 8 caracteres.').max(200),
});

export const contentSchema = z.object({
  title: z.string().trim().min(1, 'Informe o título.').max(120),
  category: z.string().trim().max(80).default(''),
  summary: z.string().trim().max(300).default(''),
  description: z.string().trim().max(4000).default(''),
  features: z.array(z.string().trim().min(1).max(120)).max(20).default([]),
  images: z
    .array(
      z.object({
        url: z.string().min(1).max(500),
        publicId: z.string().max(300).optional(),
        type: z.enum(['image', 'video']).default('image'),
      }),
    )
    .min(1, 'Adicione pelo menos uma foto ou vídeo.')
    .max(12, 'Máximo de 12 arquivos.'),
  published: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
});

export const createContentSchema = contentSchema.extend({
  kind: z.enum(['service', 'material', 'case', 'banner']),
});

export function firstError(error: z.ZodError) {
  return error.issues[0]?.message || 'Dados inválidos.';
}
