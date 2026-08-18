import { prisma } from '../../prisma/client';
import { getTodayDateString, getPastDaysDateStrings } from '../../utils/date.utils';

export class DashboardService {
  static async getDashboardData(userId: string) {
    const today = getTodayDateString();
    const past7Days = getPastDaysDateStrings(7);
    const startDate = past7Days[0];

    // Fetch user profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, profile: true },
    });

    // Fetch today checkin
    const todayCheckin = await prisma.dailyCheckIn.findUnique({
      where: {
        userId_date: {
          userId,
          date: today,
        },
      },
    });

    // Fetch active habits & today logs
    const habits = await prisma.habit.findMany({
      where: { userId, active: true },
      include: {
        area: true,
        logs: {
          where: { date: { in: past7Days } },
        },
      },
    });

    const habitsWithToday = habits.map((h) => {
      const todayLog = h.logs.find((l) => l.date === today);
      const past7Logs = h.logs.filter((l) => l.completed).length;
      return {
        id: h.id,
        name: h.name,
        target: h.target,
        frequency: h.frequency,
        area: h.area,
        completedToday: !!todayLog?.completed,
        rate7Days: Math.round((past7Logs / 7) * 100),
      };
    });

    const habitsCompletedTodayCount = habitsWithToday.filter((h) => h.completedToday).length;

    // Fetch goals
    const activeGoals = await prisma.goal.findMany({
      where: {
        userId,
        status: { in: ['NOT_STARTED', 'IN_PROGRESS'] },
      },
      include: { area: true },
      orderBy: [{ priority: 'desc' }, { progress: 'desc' }],
    });

    const topPriorityGoal = activeGoals[0] || null;

    // Fetch active projects
    const activeProjects = await prisma.project.findMany({
      where: {
        userId,
        status: { in: ['PLANNING', 'ACTIVE'] },
      },
      include: { area: true, goal: true },
      take: 4,
      orderBy: { updatedAt: 'desc' },
    });

    // Fetch pending tasks
    const pendingTasks = await prisma.task.findMany({
      where: {
        userId,
        status: { not: 'COMPLETED' },
      },
      include: { area: true, goal: true, project: true },
      take: 6,
      orderBy: [{ priority: 'desc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
    });

    // Weekly metrics
    const completedTasksThisWeekCount = await prisma.task.count({
      where: {
        userId,
        status: 'COMPLETED',
        updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });

    const checkinDaysCount = await prisma.dailyCheckIn.count({
      where: {
        userId,
        date: { gte: startDate },
      },
    });

    // Calculate weekly habit rate
    const totalHabitSlots = habits.length * 7;
    let totalCompletedHabitsInWeek = 0;
    habits.forEach((h) => {
      totalCompletedHabitsInWeek += h.logs.filter((l) => l.completed).length;
    });
    const weeklyHabitRate = totalHabitSlots > 0 ? Math.round((totalCompletedHabitsInWeek / totalHabitSlots) * 100) : 0;

    // Generate dynamic contextual insight
    let dynamicInsight = {
      title: 'Insight Atlas do Dia',
      type: 'FOCUS',
      content: 'Defina 1 prioridade clara para hoje antes de abrir caixas de entrada ou redes sociais.',
    };

    if (todayCheckin) {
      if (todayCheckin.sleepHours < 6.5) {
        dynamicInsight = {
          title: 'Atenção à Recuperação',
          type: 'ENERGY',
          content: `Você registrou ${todayCheckin.sleepHours}h de sono hoje. Reduza a complexidade das tarefas da tarde e proteja seu bloco matinal para o trabalho mais importante.`,
        };
      } else if (todayCheckin.energy >= 8 && todayCheckin.focus >= 8) {
        dynamicInsight = {
          title: 'Janela de Alto Rendimento',
          type: 'MOMENTUM',
          content: 'Seus índices de energia e foco estão no ápice (>= 8/10). Aproveite esta janela para avançar no seu objetivo prioritário.',
        };
      } else if (habitsCompletedTodayCount === habits.length && habits.length > 0) {
        dynamicInsight = {
          title: 'Todos os Hábitos Concluídos!',
          type: 'SUCCESS',
          content: 'Excelente consistência hoje! O momentum diário é o maior acelerador de resultados a longo prazo.',
        };
      }
    } else if (topPriorityGoal) {
      dynamicInsight = {
        title: 'Foco na Prioridade Estratégica',
        type: 'GOAL',
        content: `Seu principal objetivo é "${topPriorityGoal.title}" (${topPriorityGoal.progress}%). Qual é a próxima micro-ação de 20 minutos que você pode concluir hoje?`,
      };
    }

    // Determine greeting
    const hour = new Date().getHours();
    let greeting = 'Olá';
    if (hour >= 5 && hour < 12) greeting = 'Bom dia';
    else if (hour >= 12 && hour < 18) greeting = 'Boa tarde';
    else greeting = 'Boa noite';

    return {
      user: {
        id: user?.id,
        name: user?.name,
        profession: user?.profile?.profession,
        onboardingCompleted: user?.profile?.onboardingCompleted,
      },
      greeting: `${greeting}, ${user?.name?.split(' ')[0] || 'Viajante'}!`,
      date: today,
      todayCheckin,
      habits: {
        total: habits.length,
        completedToday: habitsCompletedTodayCount,
        items: habitsWithToday,
      },
      topPriorityGoal,
      activeGoals: {
        total: activeGoals.length,
        items: activeGoals,
      },
      activeProjects: {
        total: activeProjects.length,
        items: activeProjects,
      },
      pendingTasks: {
        total: pendingTasks.length,
        items: pendingTasks,
      },
      weeklyProgress: {
        completedTasksCount: completedTasksThisWeekCount,
        habitAdherenceRate: weeklyHabitRate,
        daysLoggedCount: checkinDaysCount,
      },
      insight: dynamicInsight,
    };
  }
}
