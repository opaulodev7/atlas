import { prisma } from '../../prisma/client';
import { SaveCheckinInput } from './checkins.dto';
import { getTodayDateString, getPastDaysDateStrings } from '../../utils/date.utils';
import { logTimelineEvent } from '../../utils/timeline.logger';

export class CheckinsService {
  static async getTodayCheckin(userId: string) {
    const today = getTodayDateString();
    return prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });
  }

  static async getCheckinByDate(userId: string, date: string) {
    return prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });
  }

  static async saveCheckin(userId: string, input: SaveCheckinInput) {
    const date = input.date || getTodayDateString();

    const existing = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
    });

    const checkin = await prisma.dailyCheckIn.upsert({
      where: {
        userId_date: {
          userId,
          date,
        },
      },
      update: {
        mood: input.mood,
        energy: input.energy,
        focus: input.focus,
        sleepHours: input.sleepHours,
        exercise: input.exercise,
        nutrition: input.nutrition,
        screenTimeHours: input.screenTimeHours,
        notes: input.notes,
      },
      create: {
        userId,
        date,
        mood: input.mood,
        energy: input.energy,
        focus: input.focus,
        sleepHours: input.sleepHours,
        exercise: input.exercise,
        nutrition: input.nutrition,
        screenTimeHours: input.screenTimeHours,
        notes: input.notes,
      },
    });

    if (!existing) {
      await logTimelineEvent({
        userId,
        type: 'CHECKIN',
        title: `Check-in Diário (${date})`,
        description: `Humor: ${checkin.mood}/10 | Energia: ${checkin.energy}/10 | Foco: ${checkin.focus}/10 | Sono: ${checkin.sleepHours}h`,
        entityId: checkin.id,
        metadata: {
          mood: checkin.mood,
          energy: checkin.energy,
          focus: checkin.focus,
          sleepHours: checkin.sleepHours,
        },
      });
    }

    return checkin;
  }

  static async listHistory(userId: string, days = 30) {
    const pastDays = getPastDaysDateStrings(days);
    const oldestDate = pastDays[0];

    return prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: { gte: oldestDate },
      },
      orderBy: { date: 'desc' },
    });
  }

  static async getAverages(userId: string, days = 7) {
    const pastDays = getPastDaysDateStrings(days);
    const oldestDate = pastDays[0];

    const records = await prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: { gte: oldestDate },
      },
    });

    if (records.length === 0) {
      return {
        avgMood: 0,
        avgEnergy: 0,
        avgFocus: 0,
        avgSleepHours: 0,
        avgNutrition: 0,
        avgScreenTime: 0,
        exerciseDays: 0,
        totalDaysLogged: 0,
      };
    }

    const count = records.length;
    const avgMood = records.reduce((acc, r) => acc + r.mood, 0) / count;
    const avgEnergy = records.reduce((acc, r) => acc + r.energy, 0) / count;
    const avgFocus = records.reduce((acc, r) => acc + r.focus, 0) / count;
    const avgSleepHours = records.reduce((acc, r) => acc + r.sleepHours, 0) / count;
    const avgNutrition = records.reduce((acc, r) => acc + r.nutrition, 0) / count;
    const avgScreenTime = records.reduce((acc, r) => acc + r.screenTimeHours, 0) / count;
    const exerciseDays = records.filter((r) => r.exercise).length;

    return {
      avgMood: Number(avgMood.toFixed(1)),
      avgEnergy: Number(avgEnergy.toFixed(1)),
      avgFocus: Number(avgFocus.toFixed(1)),
      avgSleepHours: Number(avgSleepHours.toFixed(1)),
      avgNutrition: Number(avgNutrition.toFixed(1)),
      avgScreenTime: Number(avgScreenTime.toFixed(1)),
      exerciseDays,
      totalDaysLogged: count,
    };
  }
}
