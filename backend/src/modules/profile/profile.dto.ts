import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
  profession: z.string().nullable().optional(),
  bio: z.string().nullable().optional(),
  personalGoals: z.string().nullable().optional(),
  values: z.string().nullable().optional(),
  interests: z.string().nullable().optional(),
  skills: z.string().nullable().optional(),
});

export const onboardingSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres').optional(),
  profession: z.string().optional(),
  bio: z.string().optional(), // "Quem é você?"
  currentSituation: z.string().optional(), // "O que está acontecendo atualmente?"
  personalGoals: z.string().optional(), // "Quais são seus principais objetivos?"
  focusAreas: z.string().optional(), // "Quais áreas precisam de atenção?"
  primaryObstacle: z.string().optional(), // "Qual é sua principal dificuldade?"
  values: z.string().optional(),
  interests: z.string().optional(),
  skills: z.string().optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type OnboardingInput = z.infer<typeof onboardingSchema>;
