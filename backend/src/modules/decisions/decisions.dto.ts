import { z } from 'zod';

export const createDecisionSchema = z.object({
  title: z.string().min(2, 'O título da decisão deve ter pelo menos 2 caracteres'),
  context: z.string().min(2, 'O contexto da decisão é obrigatório'),
  decision: z.string().min(2, 'A decisão tomada é obrigatória'),
  reason: z.string().min(2, 'O motivo da decisão é obrigatório'),
  alternatives: z.string().optional().nullable(),
  expectedOutcome: z.string().optional().nullable(),
  actualOutcome: z.string().optional().nullable(),
  learnings: z.string().optional().nullable(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)').optional(),
  reviewedAt: z.string().optional().nullable(),
});

export const updateDecisionSchema = createDecisionSchema.partial();

export type CreateDecisionInput = z.infer<typeof createDecisionSchema>;
export type UpdateDecisionInput = z.infer<typeof updateDecisionSchema>;
