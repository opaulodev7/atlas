import { z } from 'zod';

export const createJournalSchema = z.object({
  title: z.string().optional().nullable(),
  content: z.string().min(1, 'O conteúdo do diário é obrigatório'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)').optional(),
  mood: z.number().min(0).max(10).optional().nullable(),
  areaId: z.string().optional().nullable(),
  tags: z.string().optional().nullable(),
});

export const updateJournalSchema = createJournalSchema.partial();

export type CreateJournalInput = z.infer<typeof createJournalSchema>;
export type UpdateJournalInput = z.infer<typeof updateJournalSchema>;
