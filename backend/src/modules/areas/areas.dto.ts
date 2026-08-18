import { z } from 'zod';

export const createAreaSchema = z.object({
  name: z.string().min(2, 'O nome da área deve ter pelo menos 2 caracteres'),
  description: z.string().optional().nullable(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Cor hexadecimal inválida (ex: #3b82f6)').default('#3b82f6'),
  icon: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'ARCHIVED']).default('ACTIVE'),
});

export const updateAreaSchema = createAreaSchema.partial();

export type CreateAreaInput = z.infer<typeof createAreaSchema>;
export type UpdateAreaInput = z.infer<typeof updateAreaSchema>;
