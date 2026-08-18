import { prisma } from '../../prisma/client';
import { CreateDecisionInput, UpdateDecisionInput } from './decisions.dto';
import { getTodayDateString } from '../../utils/date.utils';
import { logTimelineEvent } from '../../utils/timeline.logger';

export class DecisionsService {
  static async listDecisions(userId: string) {
    return prisma.decision.findMany({
      where: { userId },
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }],
    });
  }

  static async getDecision(userId: string, id: string) {
    const decision = await prisma.decision.findFirst({
      where: { id, userId },
    });

    if (!decision) {
      throw new Error('Decisão não encontrada');
    }

    return decision;
  }

  static async createDecision(userId: string, input: CreateDecisionInput) {
    const date = input.date || getTodayDateString();

    const decision = await prisma.decision.create({
      data: {
        userId,
        title: input.title,
        context: input.context,
        decision: input.decision,
        reason: input.reason,
        alternatives: input.alternatives,
        expectedOutcome: input.expectedOutcome,
        actualOutcome: input.actualOutcome,
        learnings: input.learnings,
        date,
        reviewedAt: input.reviewedAt ? new Date(input.reviewedAt) : null,
      },
    });

    await logTimelineEvent({
      userId,
      type: 'DECISION',
      title: `Decisão Registrada: ${decision.title}`,
      description: `Decisão: ${decision.decision} | Motivo: ${decision.reason}`,
      entityId: decision.id,
      metadata: { date: decision.date },
    });

    return decision;
  }

  static async updateDecision(userId: string, id: string, input: UpdateDecisionInput) {
    const existing = await prisma.decision.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Decisão não encontrada');
    }

    return prisma.decision.update({
      where: { id },
      data: {
        title: input.title,
        context: input.context,
        decision: input.decision,
        reason: input.reason,
        alternatives: input.alternatives,
        expectedOutcome: input.expectedOutcome,
        actualOutcome: input.actualOutcome,
        learnings: input.learnings,
        date: input.date,
        reviewedAt: input.reviewedAt !== undefined ? (input.reviewedAt ? new Date(input.reviewedAt) : null) : undefined,
      },
    });
  }

  static async deleteDecision(userId: string, id: string) {
    const existing = await prisma.decision.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Decisão não encontrada');
    }

    return prisma.decision.delete({
      where: { id },
    });
  }
}
