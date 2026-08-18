import { z } from 'zod';

export const saveCheckinSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato de data inválido (YYYY-MM-DD)').optional(),
  mood: z.number().min(0).max(10).default(5),
  energy: z.number().min(0).max(10).default(5),
  focus: z.number().min(0).max(10).default(5),
  sleepHours: z.number().min(0).max(24).default(7),
  exercise: z.boolean().default(false),
  nutrition: z.number().min(0).max(10).default(5),
  screenTimeHours: z.number().min(0).max(24).default(4),
  notes: z.string().optional().nullable(),
});

export type SaveCheckinInput = z.infer<typeof saveCheckinSchema>;
