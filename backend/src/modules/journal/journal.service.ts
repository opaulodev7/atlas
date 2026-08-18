import { prisma } from '../../prisma/client';
import { CreateJournalInput, UpdateJournalInput } from './journal.dto';
import { getTodayDateString } from '../../utils/date.utils';
import { logTimelineEvent } from '../../utils/timeline.logger';

export class JournalService {
  static async listEntries(userId: string, filters?: { search?: string; areaId?: string }) {
    const where: any = { userId };

    if (filters?.areaId) {
      where.areaId = filters.areaId;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { tags: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return prisma.journalEntry.findMany({
      where,
      include: { area: true },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async getEntry(userId: string, id: string) {
    const entry = await prisma.journalEntry.findFirst({
      where: { id, userId },
      include: { area: true },
    });

    if (!entry) {
      throw new Error('Entrada do diário não encontrada');
    }

    return entry;
  }

  static async createEntry(userId: string, input: CreateJournalInput) {
    const date = input.date || getTodayDateString();

    const entry = await prisma.journalEntry.create({
      data: {
        userId,
        title: input.title,
        content: input.content,
        date,
        mood: input.mood,
        areaId: input.areaId,
        tags: input.tags,
      },
      include: { area: true },
    });

    await logTimelineEvent({
      userId,
      type: 'JOURNAL',
      title: entry.title ? `Diário: ${entry.title}` : `Entrada no Diário (${entry.date})`,
      description: entry.content.length > 150 ? entry.content.substring(0, 150) + '...' : entry.content,
      entityId: entry.id,
      metadata: { mood: entry.mood, tags: entry.tags },
    });

    return entry;
  }

  static async updateEntry(userId: string, id: string, input: UpdateJournalInput) {
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Entrada do diário não encontrada');
    }

    return prisma.journalEntry.update({
      where: { id },
      data: input,
      include: { area: true },
    });
  }

  static async deleteEntry(userId: string, id: string) {
    const existing = await prisma.journalEntry.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Entrada do diário não encontrada');
    }

    return prisma.journalEntry.delete({
      where: { id },
    });
  }
}
