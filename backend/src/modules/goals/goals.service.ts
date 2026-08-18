import { prisma } from '../../prisma/client';
import { CreateGoalInput, UpdateGoalInput, UpdateGoalProgressInput } from './goals.dto';
import { logTimelineEvent } from '../../utils/timeline.logger';

export class GoalsService {
  static async listGoals(userId: string, filters?: { status?: string; areaId?: string }) {
    const where: any = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.areaId) where.areaId = filters.areaId;

    return prisma.goal.findMany({
      where,
      include: {
        area: true,
        projects: {
          select: { id: true, title: true, status: true, progress: true },
        },
        tasks: {
          select: { id: true, title: true, status: true, priority: true },
        },
        plans: {
          select: { id: true, title: true, status: true },
        },
      },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async getGoal(userId: string, id: string) {
    const goal = await prisma.goal.findFirst({
      where: { id, userId },
      include: {
        area: true,
        projects: true,
        tasks: true,
        plans: {
          include: { steps: true },
        },
      },
    });

    if (!goal) {
      throw new Error('Objetivo não encontrado');
    }

    return goal;
  }

  static async createGoal(userId: string, input: CreateGoalInput) {
    const goal = await prisma.goal.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        areaId: input.areaId,
        priority: input.priority || 'MEDIUM',
        status: input.status || 'NOT_STARTED',
        progress: input.progress || 0,
        deadline: input.deadline ? new Date(input.deadline) : null,
      },
      include: { area: true },
    });

    await logTimelineEvent({
      userId,
      type: 'GOAL_CREATED',
      title: `Novo Objetivo: ${goal.title}`,
      description: goal.description || undefined,
      entityId: goal.id,
      metadata: { priority: goal.priority, status: goal.status },
    });

    return goal;
  }

  static async updateGoal(userId: string, id: string, input: UpdateGoalInput) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Objetivo não encontrado');
    }

    const wasCompleted = existing.status === 'COMPLETED';
    const isNowCompleted = input.status === 'COMPLETED' || input.progress === 100;

    const goal = await prisma.goal.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        areaId: input.areaId,
        priority: input.priority,
        status: input.status,
        progress: input.progress !== undefined ? input.progress : undefined,
        deadline: input.deadline !== undefined ? (input.deadline ? new Date(input.deadline) : null) : undefined,
      },
      include: { area: true },
    });

    if (!wasCompleted && isNowCompleted) {
      await logTimelineEvent({
        userId,
        type: 'GOAL_COMPLETED',
        title: `Objetivo Concluído: ${goal.title}`,
        description: 'Parabéns pela conquista do seu objetivo!',
        entityId: goal.id,
      });
    }

    return goal;
  }

  static async updateProgress(userId: string, id: string, input: UpdateGoalProgressInput) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Objetivo não encontrado');
    }

    let status = input.status || (existing.status as any);
    if (input.progress === 100) {
      status = 'COMPLETED';
    } else if (input.progress > 0 && status === 'NOT_STARTED') {
      status = 'IN_PROGRESS';
    }

    return this.updateGoal(userId, id, { progress: input.progress, status });
  }

  static async deleteGoal(userId: string, id: string) {
    const existing = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Objetivo não encontrado');
    }

    return prisma.goal.delete({
      where: { id },
    });
  }
}
