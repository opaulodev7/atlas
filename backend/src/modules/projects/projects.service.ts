import { prisma } from '../../prisma/client';
import { CreateProjectInput, UpdateProjectInput } from './projects.dto';
import { logTimelineEvent } from '../../utils/timeline.logger';

export class ProjectsService {
  static async listProjects(userId: string, filters?: { status?: string; goalId?: string; areaId?: string }) {
    const where: any = { userId };
    if (filters?.status) where.status = filters.status;
    if (filters?.goalId) where.goalId = filters.goalId;
    if (filters?.areaId) where.areaId = filters.areaId;

    return prisma.project.findMany({
      where,
      include: {
        goal: { select: { id: true, title: true, status: true, area: true } },
        area: true,
        tasks: {
          select: { id: true, title: true, status: true, priority: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async getProject(userId: string, id: string) {
    const project = await prisma.project.findFirst({
      where: { id, userId },
      include: {
        goal: true,
        area: true,
        tasks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new Error('Projeto não encontrado');
    }

    return project;
  }

  static async createProject(userId: string, input: CreateProjectInput) {
    let areaId = input.areaId;
    if (!areaId && input.goalId) {
      const goal = await prisma.goal.findUnique({ where: { id: input.goalId } });
      if (goal?.areaId) areaId = goal.areaId;
    }

    const project = await prisma.project.create({
      data: {
        userId,
        title: input.title,
        description: input.description,
        goalId: input.goalId,
        areaId,
        status: input.status || 'PLANNING',
        progress: input.progress || 0,
        deadline: input.deadline ? new Date(input.deadline) : null,
      },
      include: { goal: true, area: true },
    });

    await logTimelineEvent({
      userId,
      type: 'PROJECT_CREATED',
      title: `Novo Projeto: ${project.title}`,
      description: project.description || undefined,
      entityId: project.id,
    });

    return project;
  }

  static async updateProject(userId: string, id: string, input: UpdateProjectInput) {
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Projeto não encontrado');
    }

    const wasCompleted = existing.status === 'COMPLETED';
    const isNowCompleted = input.status === 'COMPLETED' || input.progress === 100;

    const project = await prisma.project.update({
      where: { id },
      data: {
        title: input.title,
        description: input.description,
        goalId: input.goalId,
        areaId: input.areaId,
        status: input.status,
        progress: input.progress !== undefined ? input.progress : undefined,
        deadline: input.deadline !== undefined ? (input.deadline ? new Date(input.deadline) : null) : undefined,
      },
      include: { goal: true, area: true },
    });

    if (!wasCompleted && isNowCompleted) {
      await logTimelineEvent({
        userId,
        type: 'PROJECT_COMPLETED',
        title: `Projeto Concluído: ${project.title}`,
        description: 'Projeto finalizado com sucesso!',
        entityId: project.id,
      });
    }

    return project;
  }

  static async deleteProject(userId: string, id: string) {
    const existing = await prisma.project.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Projeto não encontrado');
    }

    return prisma.project.delete({
      where: { id },
    });
  }
}
