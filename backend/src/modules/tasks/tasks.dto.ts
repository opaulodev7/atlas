import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'O título da tarefa é obrigatório'),
  description: z.string().optional().nullable(),
  goalId: z.string().optional().nullable(),
  projectId: z.string().optional().nullable(),
  areaId: z.string().optional().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
  deadline: z.string().optional().nullable(),
});

export const updateTaskSchema = createTaskSchema.partial();

export const toggleTaskSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
export type ToggleTaskInput = z.infer<typeof toggleTaskSchema>;
