import { prisma } from '../../prisma/client';

export class TimelineService {
  static async listEvents(
    userId: string,
    filters?: {
      type?: string;
      limit?: number;
      offset?: number;
    }
  ) {
    const limit = filters?.limit || 50;
    const offset = filters?.offset || 0;
    const where: any = { userId };

    if (filters?.type && filters.type !== 'ALL') {
      where.type = filters.type;
    }

    const [events, total] = await Promise.all([
      prisma.timelineEvent.findMany({
        where,
        orderBy: { date: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.timelineEvent.count({ where }),
    ]);

    return {
      events,
      total,
      limit,
      offset,
    };
  }
}
