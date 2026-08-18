import { prisma } from '../../prisma/client';
import { CreateHabitInput, UpdateHabitInput, LogHabitInput } from './habits.dto';
import { getPastDaysDateStrings, getTodayDateString, formatDateString } from '../../utils/date.utils';

export class HabitsService {
  static async listHabits(userId: string) {
    const habits = await prisma.habit.findMany({
      where: { userId },
      include: {
        area: true,
        logs: {
          orderBy: { date: 'desc' },
          take: 60, // last 60 days
        },
      },
      orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
    });

    const past7Days = getPastDaysDateStrings(7);
    const past30Days = getPastDaysDateStrings(30);
    const today = getTodayDateString();

    const enrichedHabits = habits.map((habit) => {
      const logsMap = new Map<string, boolean>();
      habit.logs.forEach((log) => {
        if (log.completed) {
          logsMap.set(log.date, true);
        }
      });

      // Calculate 7-day completion
      const completed7DaysCount = past7Days.filter((d) => logsMap.has(d)).length;
      const rate7Days = Math.round((completed7DaysCount / 7) * 100);

      // Calculate 30-day completion
      const completed30DaysCount = past30Days.filter((d) => logsMap.has(d)).length;
      const rate30Days = Math.round((completed30DaysCount / 30) * 100);

      // Calculate current streak
      let currentStreak = 0;
      let checkDate = new Date();
      
      // If not completed today, start checking from yesterday to not break ongoing streak
      const completedToday = logsMap.has(today);
      if (completedToday) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        checkDate.setDate(checkDate.getDate() - 1);
      }

      while (true) {
        const dateStr = formatDateString(checkDate);
        if (logsMap.has(dateStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }

      // 7-day history matrix
      const weekHistory = past7Days.map((dateStr) => ({
        date: dateStr,
        completed: logsMap.has(dateStr),
      }));

      return {
        ...habit,
        todayCompleted: completedToday,
        currentStreak,
        rate7Days,
        rate30Days,
        weekHistory,
      };
    });

    return enrichedHabits;
  }

  static async getHabit(userId: string, id: string) {
    const habit = await prisma.habit.findFirst({
      where: { id, userId },
      include: {
        area: true,
        logs: {
          orderBy: { date: 'desc' },
        },
      },
    });

    if (!habit) {
      throw new Error('Hábito não encontrado');
    }

    return habit;
  }

  static async createHabit(userId: string, input: CreateHabitInput) {
    return prisma.habit.create({
      data: {
        userId,
        name: input.name,
        description: input.description,
        areaId: input.areaId,
        frequency: input.frequency || 'DAILY',
        target: input.target || '1x ao dia',
        active: input.active !== undefined ? input.active : true,
      },
      include: { area: true },
    });
  }

  static async updateHabit(userId: string, id: string, input: UpdateHabitInput) {
    const existing = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Hábito não encontrado');
    }

    return prisma.habit.update({
      where: { id },
      data: input,
      include: { area: true },
    });
  }

  static async toggleHabitLog(userId: string, habitId: string, input: LogHabitInput) {
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId },
    });

    if (!habit) {
      throw new Error('Hábito não encontrado');
    }

    const existingLog = await prisma.habitLog.findUnique({
      where: {
        habitId_date: {
          habitId,
          date: input.date,
        },
      },
    });

    let newCompletedState = true;
    if (input.completed !== undefined) {
      newCompletedState = input.completed;
    } else if (existingLog) {
      newCompletedState = !existingLog.completed;
    }

    const log = await prisma.habitLog.upsert({
      where: {
        habitId_date: {
          habitId,
          date: input.date,
        },
      },
      update: {
        completed: newCompletedState,
        notes: input.notes !== undefined ? input.notes : existingLog?.notes,
      },
      create: {
        habitId,
        userId,
        date: input.date,
        completed: newCompletedState,
        notes: input.notes,
      },
    });

    return log;
  }

  static async deleteHabit(userId: string, id: string) {
    const existing = await prisma.habit.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new Error('Hábito não encontrado');
    }

    return prisma.habit.delete({
      where: { id },
    });
  }
}
