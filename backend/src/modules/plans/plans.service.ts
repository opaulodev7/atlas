import { prisma } from '../../prisma/client';
import { CreatePlanInput, UpdatePlanInput } from './plans.dto';
import { logTimelineEvent } from '../../utils/timeline.logger';

export class PlansService {
  static async listPlans(userId: string, filters?: { status?: string; goalId?: string }) {
    const where: any = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.goalId) where.goalId = filters.goalId;

    return prisma.plan.findMany({
      where,
      include: {
        goal: { select: { id: true, title: true, status: true } },
        steps: { orderBy: { stepNumber: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getPlan(userId: string, id: string) {
    const plan = await prisma.plan.findFirst({
      where: { id, userId },
      include: {
        goal: true,
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    if (!plan) {
      throw new Error('Plano de ação não encontrado');
    }

    return plan;
  }

  static async createPlan(userId: string, input: CreatePlanInput) {
    const plan = await prisma.plan.create({
      data: {
        userId,
        title: input.title,
        objective: input.objective,
        reason: input.reason,
        expectedResult: input.expectedResult,
        goalId: input.goalId,
        deadline: input.deadline ? new Date(input.deadline) : null,
        indicators: input.indicators,
        risks: input.risks,
        contingencyPlan: input.contingencyPlan,
        status: input.status || 'ACTIVE',
        steps: {
          create: (input.steps || []).map((step, index) => ({
            stepNumber: step.stepNumber || index + 1,
            title: step.title,
            description: step.description,
            timeWindow: step.timeWindow,
            howToExecute: step.howToExecute,
            status: step.status || 'PENDING',
          })),
        },
      },
      include: {
        goal: true,
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    await logTimelineEvent({
      userId,
      type: 'PLAN_CREATED',
      title: `Novo Plano de Ação: ${plan.title}`,
      description: `Objetivo: ${plan.objective} | Etapas: ${plan.steps.length}`,
      entityId: plan.id,
      metadata: { stepsCount: plan.steps.length },
    });

    return plan;
  }

  static async updatePlan(userId: string, id: string, input: UpdatePlanInput) {
    const existing = await prisma.plan.findFirst({
      where: { id, userId },
      include: { steps: true },
    });

    if (!existing) {
      throw new Error('Plano de ação não encontrado');
    }

    const { steps, ...planData } = input;

    // Update main plan
    const updatedPlan = await prisma.plan.update({
      where: { id },
      data: {
        title: planData.title,
        objective: planData.objective,
        reason: planData.reason,
        expectedResult: planData.expectedResult,
        goalId: planData.goalId,
        deadline: planData.deadline !== undefined ? (planData.deadline ? new Date(planData.deadline) : null) : undefined,
        indicators: planData.indicators,
        risks: planData.risks,
        contingencyPlan: planData.contingencyPlan,
        status: planData.status,
      },
      include: {
        goal: true,
        steps: { orderBy: { stepNumber: 'asc' } },
      },
    });

    // If steps provided, replace or update
    if (steps && Array.isArray(steps)) {
      await prisma.planStep.deleteMany({ where: { planId: id } });
      await prisma.planStep.createMany({
        data: steps.map((step, index) => ({
          planId: id,
          stepNumber: step.stepNumber || index + 1,
          title: step.title,
          description: step.description,
          timeWindow: step.timeWindow,
          howToExecute: step.howToExecute,
          status: step.status || 'PENDING',
        })),
      });
    }

    return this.getPlan(userId, id);
  }

  static async toggleStep(userId: string, planId: string, stepId: string) {
    const plan = await prisma.plan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) {
      throw new Error('Plano não encontrado');
    }

    const step = await prisma.planStep.findFirst({
      where: { id: stepId, planId },
    });

    if (!step) {
      throw new Error('Etapa não encontrada');
    }

    const newStatus = step.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    const completedAt = newStatus === 'COMPLETED' ? new Date() : null;

    await prisma.planStep.update({
      where: { id: stepId },
      data: {
        status: newStatus,
        completedAt,
      },
    });

    return this.getPlan(userId, planId);
  }

  static async deletePlan(userId: string, id: string) {
    const existing = await prisma.plan.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Plano de ação não encontrado');
    }

    return prisma.plan.delete({
      where: { id },
    });
  }
}
