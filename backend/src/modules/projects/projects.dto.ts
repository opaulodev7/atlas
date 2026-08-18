import { z } from 'zod';

export const createProjectSchema = z.object({
  title: z.string().min(2, 'O título do projeto deve ter pelo menos 2 caracteres'),
  description: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  areaId: z.string().optional().nullable(),
  status: z.enum(['PLANNING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'CANCELLED']).default('PLANNING'),
  progress: z.number().min(0).max(100).default(0),
  deadline: z.string().optional().nullable(),
});

export const updateProjectSchema = createProjectSchema.partial();

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
