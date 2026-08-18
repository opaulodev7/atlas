import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Flame,
  Target,
  CheckSquare,
  Activity,
  ArrowRight,
  TrendingUp,
  Clock,
  Plus,
  CheckCircle2,
  Circle,
  FolderKanban,
  Zap,
  Lightbulb,
} from 'lucide-react';
import { dashboardService, habitsService, tasksService } from '../services/api';
import { DashboardSummary } from '../types';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DashboardPage: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = async () => {
    try {
      const data = await dashboardService.getSummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleHabit = async (habitId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const today = summary?.date || new Date().toISOString().split('T')[0];
      await habitsService.toggleLog(habitId, today);
      loadData();
    } catch (err) {
      console.error('Error toggling habit:', err);
    }
  };

  const handleToggleTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await tasksService.toggle(taskId);
      loadData();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando visão geral do Atlas..." />;
  }

  if (!summary) {
    return (
      <div className="text-center py-12 text-slate-400">
        Não foi possível carregar as informações. Tente recarregar a página.
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Greeting & Date */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            {summary.greeting}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Aqui está o diagnóstico e as prioridades do seu dia.
          </p>
        </div>

        {/* Quick Checkin Action */}
        {!summary.todayCheckin ? (
          <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-xl">
            <Activity className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-amber-300">Check-in de hoje pendente</p>
              <p className="text-slate-400">Registre seu humor, energia e sono.</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/checkin')}
              className="ml-2 shrink-0"
            >
              Fazer Check-in
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-xl">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-300">Check-in Concluído</p>
              <p className="text-slate-400">
                Humor: {summary.todayCheckin.mood}/10 | Energia: {summary.todayCheckin.energy}/10 | Sono: {summary.todayCheckin.sleepHours}h
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 2. Top Priority Banner & AI Insight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Priority Card */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-850 border-brand-500/20">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-400">
              <Target className="w-4 h-4" />
              <span>Prioridade Número 1 Atual</span>
            </div>
            {summary.topPriorityGoal && (
              <Badge variant="warning" size="sm">
                {summary.topPriorityGoal.priority}
              </Badge>
            )}
          </div>

          {summary.topPriorityGoal ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-100">
                  {summary.topPriorityGoal.title}
                </h3>
                {summary.topPriorityGoal.description && (
                  <p className="text-xs sm:text-sm text-slate-400 mt-1 line-clamp-2">
                    {summary.topPriorityGoal.description}
                  </p>
                )}
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium text-slate-300 mb-1.5">
                  <span>Progresso da Meta</span>
                  <span className="font-bold text-brand-400">{summary.topPriorityGoal.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-emerald-400 rounded-full transition-all duration-500"
                    style={{ width: `${summary.topPriorityGoal.progress}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-xs text-slate-400">
                  Área: <strong className="text-slate-200">{summary.topPriorityGoal.area?.name || 'Geral'}</strong>
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/goals')}
                  icon={<ArrowRight className="w-4 h-4" />}
                >
                  Gerenciar Objetivos
                </Button>
              </div>
            </div>
          ) : (
            <div className="py-4 text-center">
              <p className="text-sm text-slate-400">Nenhum objetivo prioritário cadastrado ainda.</p>
              <Button
                variant="primary"
                size="sm"
                className="mt-3"
                onClick={() => navigate('/goals')}
                icon={<Plus className="w-4 h-4" />}
              >
                Definir Primeiro Objetivo
              </Button>
            </div>
          )}
        </Card>

        {/* AI Dynamic Insight Card */}
        <Card className="flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950 border-sky-500/20">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-400 mb-3">
              <Lightbulb className="w-4 h-4" />
              <span>{summary.insight.title}</span>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {summary.insight.content}
            </p>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">Diagnóstico em tempo real</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/ai')}
              icon={<Sparkles className="w-3.5 h-3.5 text-brand-400" />}
            >
              Consultar IA
            </Button>
          </div>
        </Card>
      </div>

      {/* 3. Weekly Progress Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 bg-slate-900/60">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
            <CheckSquare className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Tarefas Concluídas (7d)</p>
            <p className="text-2xl font-black text-slate-100">
              {summary.weeklyProgress.completedTasksCount}
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-slate-900/60">
          <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Aderência aos Hábitos</p>
            <p className="text-2xl font-black text-slate-100">
              {summary.weeklyProgress.habitAdherenceRate}%
            </p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 bg-slate-900/60">
          <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-medium">Dias Monitorados (7d)</p>
            <p className="text-2xl font-black text-slate-100">
              {summary.weeklyProgress.daysLoggedCount} <span className="text-xs text-slate-500 font-normal">/ 7</span>
            </p>
          </div>
        </Card>
      </div>

      {/* 4. Habits of the Day & Pending Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Habits Today */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold text-slate-200">Hábitos de Hoje</h2>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
              {summary.habits.completedToday} / {summary.habits.total} feitos
            </span>
          </div>

          {summary.habits.items.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              Nenhum hábito cadastrado ainda.
            </div>
          ) : (
            <div className="space-y-2">
              {summary.habits.items.map((habit) => (
                <div
                  key={habit.id}
                  onClick={(e) => handleToggleHabit(habit.id, e)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    habit.completedToday
                      ? 'bg-emerald-500/5 border-emerald-500/30 text-slate-200'
                      : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button className="text-emerald-400 shrink-0">
                      {habit.completedToday ? (
                        <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                      )}
                    </button>
                    <div>
                      <p className={`text-sm font-semibold ${habit.completedToday ? 'line-through text-slate-400' : ''}`}>
                        {habit.name}
                      </p>
                      <p className="text-[11px] text-slate-500">{habit.target}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 flex items-center gap-0.5">
                      <Flame className="w-3.5 h-3.5" />
                      {habit.currentStreak || 0}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 text-right">
            <Button variant="ghost" size="sm" onClick={() => navigate('/habits')}>
              Ver todos os hábitos →
            </Button>
          </div>
        </Card>

        {/* Pending Tasks */}
        <Card className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-brand-400" />
              <h2 className="text-base font-bold text-slate-200">Tarefas Pendentes</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/tasks')}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Nova
            </Button>
          </div>

          {summary.pendingTasks.items.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs">
              Tudo em dia! Nenhuma tarefa pendente no momento.
            </div>
          ) : (
            <div className="space-y-2">
              {summary.pendingTasks.items.map((task) => (
                <div
                  key={task.id}
                  onClick={(e) => handleToggleTask(task.id, e)}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition-all cursor-pointer"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="text-slate-500 hover:text-brand-400 shrink-0">
                      <Circle className="w-5 h-5" />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{task.title}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {task.area && (
                          <span
                            className="text-[10px] px-1.5 py-0.2 rounded font-medium"
                            style={{ backgroundColor: `${task.area.color}20`, color: task.area.color }}
                          >
                            {task.area.name}
                          </span>
                        )}
                        {task.deadline && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.deadline).toLocaleDateString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Badge
                    variant={
                      task.priority === 'URGENT'
                        ? 'danger'
                        : task.priority === 'HIGH'
                        ? 'warning'
                        : 'default'
                    }
                    size="sm"
                  >
                    {task.priority}
                  </Badge>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2 border-t border-slate-800/80 text-right">
            <Button variant="ghost" size="sm" onClick={() => navigate('/tasks')}>
              Ver todas as tarefas →
            </Button>
          </div>
        </Card>
      </div>

      {/* 5. Active Projects Grid */}
      {summary.activeProjects.items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <FolderKanban className="w-5 h-5 text-sky-400" />
              Projetos em Andamento ({summary.activeProjects.total})
            </h2>
            <Button variant="ghost" size="sm" onClick={() => navigate('/projects')}>
              Ver todos os projetos →
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {summary.activeProjects.items.map((proj) => (
              <Card
                key={proj.id}
                hoverable
                onClick={() => navigate('/projects')}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <Badge variant="info" size="sm">
                    {proj.status}
                  </Badge>
                  <span className="text-xs font-bold text-slate-300">{proj.progress}%</span>
                </div>

                <h3 className="text-sm font-bold text-slate-100 line-clamp-1">{proj.title}</h3>

                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-sky-500 rounded-full"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
