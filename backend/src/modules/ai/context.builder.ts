import { prisma } from '../../prisma/client';
import { getPastDaysDateStrings } from '../../utils/date.utils';

export interface UserContextSummary {
  user: {
    name: string;
    profession?: string;
    bio?: string;
    personalGoals?: string;
    values?: string;
    interests?: string;
    skills?: string;
  };
  goals: Array<{
    title: string;
    area?: string;
    priority: string;
    status: string;
    progress: number;
    deadline?: string;
  }>;
  projects: Array<{
    title: string;
    status: string;
    progress: number;
  }>;
  tasks: {
    pendingHighPriority: string[];
    pendingCount: number;
    completedRecentCount: number;
  };
  habits: Array<{
    name: string;
    area?: string;
    streak: number;
    rate7Days: number;
  }>;
  checkins: {
    recentAvgMood: number;
    recentAvgEnergy: number;
    recentAvgFocus: number;
    recentAvgSleep: number;
    recentLogs: Array<{
      date: string;
      mood: number;
      energy: number;
      focus: number;
      sleepHours: number;
      exercise: boolean;
      notes?: string;
    }>;
  };
  journal: Array<{
    date: string;
    title?: string;
    contentSnippet: string;
    mood?: number;
  }>;
  decisions: Array<{
    title: string;
    decision: string;
    date: string;
  }>;
}

export class ContextBuilder {
  static async buildUserContext(userId: string): Promise<UserContextSummary> {
    const past7Days = getPastDaysDateStrings(7);
    const past7DaysStart = past7Days[0];

    // Fetch user & profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    // Fetch active goals
    const goals = await prisma.goal.findMany({
      where: {
        userId,
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
      },
      include: { area: true },
      take: 6,
      orderBy: [{ priority: 'desc' }, { progress: 'asc' }],
    });

    // Fetch active projects
    const projects = await prisma.project.findMany({
      where: {
        userId,
        status: { in: ['PLANNING', 'ACTIVE'] },
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
    });

    // Fetch tasks stats & high priority
    const [pendingHighPriority, pendingCount, completedRecentCount] = await Promise.all([
      prisma.task.findMany({
        where: {
          userId,
          status: { not: 'COMPLETED' },
          priority: { in: ['HIGH', 'URGENT'] },
        },
        take: 5,
        orderBy: { deadline: 'asc' },
      }),
      prisma.task.count({
        where: { userId, status: { not: 'COMPLETED' } },
      }),
      prisma.task.count({
        where: {
          userId,
          status: 'COMPLETED',
          completedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ]);

    // Fetch habits and recent logs
    const habits = await prisma.habit.findMany({
      where: { userId, active: true },
      include: {
        area: true,
        logs: {
          where: { date: { gte: past7DaysStart } },
        },
      },
    });

    const habitsSummary = habits.map((h) => {
      const completedCount = h.logs.filter((l) => l.completed).length;
      const rate7Days = Math.round((completedCount / 7) * 100);
      return {
        name: h.name,
        area: h.area?.name,
        streak: completedCount, // approximation for summary
        rate7Days,
      };
    });

    // Fetch checkins
    const checkins = await prisma.dailyCheckIn.findMany({
      where: {
        userId,
        date: { gte: past7DaysStart },
      },
      orderBy: { date: 'desc' },
      take: 7,
    });

    const countCheckins = checkins.length || 1;
    const avgMood = checkins.reduce((sum, c) => sum + c.mood, 0) / countCheckins;
    const avgEnergy = checkins.reduce((sum, c) => sum + c.energy, 0) / countCheckins;
    const avgFocus = checkins.reduce((sum, c) => sum + c.focus, 0) / countCheckins;
    const avgSleep = checkins.reduce((sum, c) => sum + c.sleepHours, 0) / countCheckins;

    // Fetch recent journal entries
    const journalEntries = await prisma.journalEntry.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 3,
    });

    // Fetch recent decisions
    const decisions = await prisma.decision.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 3,
    });

    return {
      user: {
        name: user?.name || 'Usuário',
        profession: user?.profile?.profession || undefined,
        bio: user?.profile?.bio || undefined,
        personalGoals: user?.profile?.personalGoals || undefined,
        values: user?.profile?.values || undefined,
        interests: user?.profile?.interests || undefined,
        skills: user?.profile?.skills || undefined,
      },
      goals: goals.map((g) => ({
        title: g.title,
        area: g.area?.name,
        priority: g.priority,
        status: g.status,
        progress: g.progress,
        deadline: g.deadline ? g.deadline.toISOString().split('T')[0] : undefined,
      })),
      projects: projects.map((p) => ({
        title: p.title,
        status: p.status,
        progress: p.progress,
      })),
      tasks: {
        pendingHighPriority: pendingHighPriority.map((t) => t.title),
        pendingCount,
        completedRecentCount,
      },
      habits: habitsSummary,
      checkins: {
        recentAvgMood: Number(avgMood.toFixed(1)),
        recentAvgEnergy: Number(avgEnergy.toFixed(1)),
        recentAvgFocus: Number(avgFocus.toFixed(1)),
        recentAvgSleep: Number(avgSleep.toFixed(1)),
        recentLogs: checkins.map((c) => ({
          date: c.date,
          mood: c.mood,
          energy: c.energy,
          focus: c.focus,
          sleepHours: c.sleepHours,
          exercise: c.exercise,
          notes: c.notes || undefined,
        })),
      },
      journal: journalEntries.map((j) => ({
        date: j.date,
        title: j.title || undefined,
        contentSnippet: j.content.length > 200 ? j.content.substring(0, 200) + '...' : j.content,
        mood: j.mood || undefined,
      })),
      decisions: decisions.map((d) => ({
        title: d.title,
        decision: d.decision,
        date: d.date,
      })),
    };
  }

  static formatContextForPrompt(ctx: UserContextSummary): string {
    return `=== CONTEXTO DO USUÁRIO ATLAS ===
Usuário: ${ctx.user.name} | Profissão: ${ctx.user.profession || 'Não informada'}
Bio/Contexto Geral: ${ctx.user.bio || 'Sem bio'}
Valores & Habilidades: ${[ctx.user.values, ctx.user.skills].filter(Boolean).join(' | ') || 'Não especificados'}

OBJETIVOS ATIVOS (${ctx.goals.length}):
${ctx.goals.map((g) => `- [${g.priority}] ${g.title} (${g.progress}% concluído, Prazo: ${g.deadline || 'Sem prazo'}, Área: ${g.area || 'Geral'})`).join('\n') || '- Nenhum objetivo ativo'}

PROJETOS EM ANDAMENTO:
${ctx.projects.map((p) => `- ${p.title} (${p.status}, ${p.progress}%)`).join('\n') || '- Nenhum projeto'}

TAREFAS:
- Pendentes totais: ${ctx.tasks.pendingCount}
- Concluídas recentemente: ${ctx.tasks.completedRecentCount}
- Prioritárias urgentes: ${ctx.tasks.pendingHighPriority.join(', ') || 'Nenhuma tarefa urgente pendente'}

HÁBITOS & ADERÊNCIA (Últimos 7 dias):
${ctx.habits.map((h) => `- ${h.name}: ${h.rate7Days}% de cumprimento nos últimos 7 dias`).join('\n') || '- Nenhum hábito cadastrado'}

CHECK-INS BIOMÉTRICOS & ENERGIA (Médias recentes):
- Humor médio: ${ctx.checkins.recentAvgMood}/10
- Energia média: ${ctx.checkins.recentAvgEnergy}/10
- Foco médio: ${ctx.checkins.recentAvgFocus}/10
- Sono médio: ${ctx.checkins.recentAvgSleep} horas/noite
${ctx.checkins.recentLogs.map((l) => `  * ${l.date}: Humor ${l.mood}, Energia ${l.energy}, Foco ${l.focus}, Sono ${l.sleepHours}h${l.notes ? ` ("${l.notes}")` : ''}`).join('\n')}

ÚLTIMOS REGISTROS DO DIÁRIO:
${ctx.journal.map((j) => `- [${j.date}] ${j.title ? j.title + ': ' : ''}"${j.contentSnippet}"`).join('\n') || '- Nenhum diário recente'}

ÚLTIMAS DECISÕES:
${ctx.decisions.map((d) => `- [${d.date}] ${d.title}: ${d.decision}`).join('\n') || '- Nenhuma decisão recente'}
=================================`;
  }
}
