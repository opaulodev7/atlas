import { z } from 'zod';

export const createGoalSchema = z.object({
  title: z.string().min(2, 'O título do objetivo deve ter pelo menos 2 caracteres'),
  description: z.string().optional().nullable(),
  areaId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED']).default('NOT_STARTED'),
  progress: z.number().min(0).max(100).default(0),
  deadline: z.string().optional().nullable(),
});

export const updateGoalSchema = createGoalSchema.partial();

export const updateGoalProgressSchema = z.object({
  progress: z.number().min(0).max(100),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'PAUSED', 'CANCELLED']).optional(),
});

export type CreateGoalInput = z.infer<typeof createGoalSchema>;
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>;
export type UpdateGoalProgressInput = z.infer<typeof updateGoalProgressSchema>;
