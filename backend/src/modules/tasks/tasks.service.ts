import { prisma } from '../../prisma/client';
import { CreateTaskInput, UpdateTaskInput, ToggleTaskInput } from './tasks.dto';
import { logTimelineEvent } from '../../utils/timeline.logger';

export class TasksService {
  static async listTasks(
    userId: string,
    filters?: {
      status?: string;
      priority?: string;
      goalId?: string;
      projectId?: string;
      areaId?: string;
      today?: boolean;
    }
  ) {
    const where: any = { userId };

    if (filters?.status) where.status = filters.status;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.goalId) where.goalId = filters.goalId;
    if (filters?.projectId) where.projectId = filters.projectId;
    if (filters?.areaId) where.areaId = filters.areaId;

    if (filters?.today) {
      const now = new Date();
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
      where.OR = [
        { deadline: { lte: endOfDay } },
        { deadline: null, status: { not: 'COMPLETED' } },
      ];
    }

    return prisma.task.findMany({
      where,
      include: {
        goal: { select: { id: true, title: true } },
        project: { select: { id: true, title: true } },
        area: { select: { id: true, name: true, color: true } },
      },
      orderBy: [
        { status: 'asc' }, // PENDING first, then IN_PROGRESS, then COMPLETED
        { priority: 'desc' },
        { deadline: 'asc' },
        { createdAt: 'desc' },
      ],
    });
  }

  static async getTask(userId: string, id: string) {
    const task = await prisma.task.findFirst({
      where: { id, userId },
      include: {
        goal: true,
        project: true,
        area: true,
      },
    });

    if (!task) {
      throw new Error('Tarefa não encontrada');
    }

    return task;
  }

  static async createTask(userId: string, input: CreateTaskInput) {
    let areaId = input.areaId;

    // auto-inherit area if linked to goal or project
    if (!areaId && input.projectId) {
      const project = await prisma.project.findUnique({ where: { id: input.projectId } });
      if (project?.areaId) areaId = project.areaId;
    }
    if (!areaId && input.goalId) {
      const goal = await prisma.goal.findUnique({ where: { id: input.goalId } });
      if (goal?.areaId) areaId = goal.areaId;
    }

    const task = await prisma.task.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        goalId: input.goalId,
        projectId: input.projectId,
        areaId,
        priority: input.priority || 'MEDIUM',
        status: input.status || 'PENDING',
        deadline: input.deadline ? new Date(input.deadline) : null,
        completedAt: input.status === 'COMPLETED' ? new Date() : null,
      },
      include: {
        goal: true,
        project: true,
        area: true,
      },
    });

    return task;
  }

  static async updateTask(userId: string, id: string, input: UpdateTaskInput) {
    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Tarefa não encontrada');
    }

    const isCompleting = input.status === 'COMPLETED' && existing.status !== 'COMPLETED';
    const isUncompleting = input.status && input.status !== 'COMPLETED' && existing.status === 'COMPLETED';

    const completedAt = isCompleting ? new Date() : isUncompleting ? null : existing.completedAt;

    const task = await prisma.task.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        goalId: input.goalId,
        projectId: input.projectId,
        areaId: input.areaId,
        priority: input.priority,
        status: input.status,
        deadline: input.deadline !== undefined ? (input.deadline ? new Date(input.deadline) : null) : undefined,
        completedAt,
      },
      include: {
        goal: true,
        project: true,
        area: true,
      },
    });

    if (isCompleting) {
      await logTimelineEvent({
        userId,
        type: 'TASK_COMPLETED',
        title: `Tarefa Concluída: ${task.title}`,
        description: task.description || undefined,
        entityId: task.id,
      });
    }

    return task;
  }

  static async toggleTask(userId: string, id: string) {
    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Tarefa não encontrada');
    }

    const newStatus = existing.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    return this.updateTask(userId, id, { status: newStatus });
  }

  static async deleteTask(userId: string, id: string) {
    const existing = await prisma.task.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Tarefa não encontrada');
    }

    return prisma.task.delete({
      where: { id },
    });
  }
}
