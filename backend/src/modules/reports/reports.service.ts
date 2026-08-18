import { prisma } from '../../prisma/client';
import { getPastDaysDateStrings } from '../../utils/date.utils';
import { AIService } from '../ai/ai.service';
import { ContextBuilder } from '../ai/context.builder';

export class ReportsService {
  static async generateWeeklyReport(userId: string) {
    const past7Days = getPastDaysDateStrings(7);
    const startDate = past7Days[0];
    const endDate = past7Days[past7Days.length - 1];

    // 1. Fetch data for the week
    const [tasksCompleted, tasksPending, habits, checkins, journalEntries, goals] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: 'COMPLETED',
          updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        include: { area: true },
      }),
      prisma.task.findMany({
        where: {
          userId,
          status: { not: 'COMPLETED' },
        },
        include: { area: true },
        take: 10,
      }),
      prisma.habit.findMany({
        where: { userId, active: true },
        include: {
          logs: {
            where: { date: { gte: startDate } },
          },
        },
      }),
      prisma.dailyCheckIn.findMany({
        where: {
          userId,
          date: { gte: startDate },
        },
        orderBy: { date: 'asc' },
      }),
      prisma.journalEntry.findMany({
        where: {
          userId,
          date: { gte: startDate },
        },
        orderBy: { date: 'desc' },
      }),
      prisma.goal.findMany({
        where: {
          userId,
          status: { in: ['IN_PROGRESS', 'COMPLETED'] },
        },
        include: { area: true },
      }),
    ]);

    // Metrics calculations
    const checkinDaysCount = checkins.length;
    const avgMood = checkinDaysCount ? Number((checkins.reduce((a, b) => a + b.mood, 0) / checkinDaysCount).toFixed(1)) : 0;
    const avgEnergy = checkinDaysCount ? Number((checkins.reduce((a, b) => a + b.energy, 0) / checkinDaysCount).toFixed(1)) : 0;
    const avgFocus = checkinDaysCount ? Number((checkins.reduce((a, b) => a + b.focus, 0) / checkinDaysCount).toFixed(1)) : 0;
    const avgSleep = checkinDaysCount ? Number((checkins.reduce((a, b) => a + b.sleepHours, 0) / checkinDaysCount).toFixed(1)) : 0;
    const exerciseDays = checkins.filter((c) => c.exercise).length;

    let totalPossibleHabits = habits.length * 7;
    let completedHabitsCount = 0;
    const habitBreakdown = habits.map((h) => {
      const completed = h.logs.filter((l) => l.completed).length;
      completedHabitsCount += completed;
      return {
        name: h.name,
        completedDays: completed,
        rate: Math.round((completed / 7) * 100),
      };
    });

    const overallHabitRate = totalPossibleHabits > 0 ? Math.round((completedHabitsCount / totalPossibleHabits) * 100) : 0;

    const metricsSummary = {
      period: `${startDate} a ${endDate}`,
      tasksCompletedCount: tasksCompleted.length,
      tasksPendingCount: tasksPending.length,
      checkinDaysCount,
      avgMood,
      avgEnergy,
      avgFocus,
      avgSleep,
      exerciseDays,
      overallHabitRate,
      habitBreakdown,
      journalEntriesCount: journalEntries.length,
    };

    // Ask AI for synthesis
    const prompt = `Gere o Relatório Retrospectivo Semanal oficial do Atlas para o período ${startDate} a ${endDate}.

MÉTRICAS CONSOLIDADAS:
- Tarefas concluídas no período: ${tasksCompleted.length} (Exemplos: ${tasksCompleted.map((t) => t.title).slice(0, 5).join(', ') || 'Nenhuma'})
- Tarefas pendentes: ${tasksPending.length}
- Dias com check-in registrado: ${checkinDaysCount} de 7
- Médias biométricas: Humor ${avgMood}/10, Energia ${avgEnergy}/10, Foco ${avgFocus}/10, Sono ${avgSleep}h, Dias de Exercício: ${exerciseDays}/7
- Taxa geral de hábitos: ${overallHabitRate}% (${habitBreakdown.map((h) => `${h.name}: ${h.rate}%`).join(', ')})
- Entradas no diário: ${journalEntries.length}

ESTRUTURE O RELATÓRIO OBRIGATORIAMENTE COM AS SEGUINTES SEÇÕES:
1. **O que aconteceu [FATO]** (Fatos objetivos ocorridos na semana)
2. **O que evoluiu [INTERPRETAÇÃO]** (Análise qualitativa dos avanços)
3. **O que não funcionou [FATO & INTERPRETAÇÃO]** (Gargalos, hábitos negligenciados ou quedas de energia)
4. **Possíveis padrões detectados [HIPÓTESE]** (Relações entre sono, foco, hábitos e entregas)
5. **Principais gargalos identificados [DIAGNÓSTICO]**
6. **Prioridade número 1 da próxima semana [FOCO]**
7. **Recomendações práticas estruturadas [RECOMENDAÇÃO]** (Ações específicas com blocos sugeridos)

Lembre-se de manter rigor na distinção entre Fato, Interpretação, Hipótese e Recomendação.`;

    const aiResult = await AIService.chat(userId, prompt);

    return {
      period: { startDate, endDate },
      metrics: metricsSummary,
      synthesis: aiResult.assistantMessage.content,
      tasksCompleted: tasksCompleted.map((t) => ({ id: t.id, title: t.title, area: t.area?.name })),
      habits: habitBreakdown,
      createdAt: new Date().toISOString(),
    };
  }
}
