import { z } from 'zod';

export const createHabitSchema = z.object({
  name: z.string().min(2, 'O nome do hábito deve ter pelo menos 2 caracteres'),
  description: z.string().optional().nullable(),
  areaId: z.string().optional().nullable(),
  frequency: z.enum(['DAILY', 'WEEKDAYS', 'WEEKENDS', 'WEEKLY']).default('DAILY'),
  target: z.string().default('1x ao dia'),
  active: z.boolean().default(true),
});

export const updateHabitSchema = createHabitSchema.partial();

export const logHabitSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)'),
  completed: z.boolean().optional(),
  notes: z.string().optional().nullable(),
});

export type CreateHabitInput = z.infer<typeof createHabitSchema>;
export type UpdateHabitInput = z.infer<typeof updateHabitSchema>;
export type LogHabitInput = z.infer<typeof logHabitSchema>;
