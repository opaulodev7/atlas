import { prisma } from '../../prisma/client';
import { CreateAreaInput, UpdateAreaInput } from './areas.dto';

export class AreasService {
  static async listAreas(userId: string) {
    return prisma.lifeArea.findMany({
      where: { userId },
      include: {
        _count: {
          select: {
            goals: true,
            projects: true,
            tasks: true,
            habits: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
  }

  static async getArea(userId: string, id: string) {
    const area = await prisma.lifeArea.findFirst({
      where: { id, userId },
      include: {
        goals: {
          orderBy: { createdAt: 'desc' },
        },
        projects: {
          orderBy: { createdAt: 'desc' },
        },
        tasks: {
          where: { status: { not: 'COMPLETED' } },
          orderBy: { createdAt: 'desc' },
        },
        habits: true,
      },
    });

    if (!area) {
      throw new Error('Área da vida não encontrada');
    }

    return area;
  }

  static async createArea(userId: string, input: CreateAreaInput) {
    return prisma.lifeArea.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        color: input.color || '#3b82f6',
        icon: input.icon || 'Folder',
        status: input.status || 'ACTIVE',
      },
    });
  }

  static async updateArea(userId: string, id: string, input: UpdateAreaInput) {
    const area = await prisma.lifeArea.findFirst({
      where: { id, userId },
    });

    if (!area) {
      throw new Error('Área da vida não encontrada');
    }

    return prisma.lifeArea.update({
      where: { id },
      data: input,
    });
  }

  static async deleteArea(userId: string, id: string) {
    const area = await prisma.lifeArea.findFirst({
      where: { id, userId },
    });

    if (!area) {
      throw new Error('Área da vida não encontrada');
    }

    return prisma.lifeArea.delete({
      where: { id },
    });
  }
}
