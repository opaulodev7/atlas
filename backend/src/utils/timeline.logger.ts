import { prisma } from '../prisma/client';

export type TimelineEventType =
  | 'JOURNAL'
  | 'CHECKIN'
  | 'GOAL_CREATED'
  | 'GOAL_COMPLETED'
  | 'PROJECT_CREATED'
  | 'PROJECT_COMPLETED'
  | 'TASK_COMPLETED'
  | 'DECISION'
  | 'PLAN_CREATED'
  | 'CUSTOM';

export async function logTimelineEvent(params: {
  userId: string;
  type: TimelineEventType;
  title: string;
  description?: string;
  entityId?: string;
  metadata?: Record<string, any>;
  date?: Date;
}) {
  try {
    return await prisma.timelineEvent.create({
      data: {
        userId: params.userId,
        type: params.type,
        title: params.title,
        description: params.description,
        entityId: params.entityId,
        metadata: params.metadata ? JSON.stringify(params.metadata) : null,
        date: params.date || new Date(),
      },
    });
  } catch (error) {
    console.error('Failed to log timeline event:', error);
    return null;
  }
}
