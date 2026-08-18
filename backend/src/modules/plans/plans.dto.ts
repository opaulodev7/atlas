import { z } from 'zod';

export const planStepSchema = z.object({
  stepNumber: z.number().int().min(1),
  title: z.string().min(1, 'Título da etapa é obrigatório'),
  description: z.string().optional().nullable(),
  timeWindow: z.string().optional().nullable(),
  howToExecute: z.string().optional().nullable(),
  status: z.enum(['PENDING', 'COMPLETED']).default('PENDING'),
});

export const createPlanSchema = z.object({
  title: z.string().min(2, 'O título do plano deve ter pelo menos 2 caracteres'),
  objective: z.string().min(2, 'O objetivo do plano é obrigatório'),
  reason: z.string().min(2, 'O motivo do plano é obrigatório'),
  expectedResult: z.string().min(2, 'O resultado esperado é obrigatório'),
  goalId: z.string().optional().nullable(),
  deadline: z.string().optional().nullable(),
  indicators: z.string().optional().nullable(),
  risks: z.string().optional().nullable(),
  contingencyPlan: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'ACTIVE', 'COMPLETED', 'ARCHIVED']).default('ACTIVE'),
  steps: z.array(planStepSchema).optional().default([]),
});

export const updatePlanSchema = createPlanSchema.partial();

export const togglePlanStepSchema = z.object({
  status: z.enum(['PENDING', 'COMPLETED']).optional(),
});

export type CreatePlanInput = z.infer<typeof createPlanSchema>;
export type UpdatePlanInput = z.infer<typeof updatePlanSchema>;
export type PlanStepInput = z.infer<typeof planStepSchema>;
export type TogglePlanStepInput = z.infer<typeof togglePlanStepSchema>;
