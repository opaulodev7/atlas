import React, { useState, useEffect } from 'react';
import { History, Target, FolderKanban, CheckSquare, Activity, BookOpen, GitBranch, Sparkles, Filter } from 'lucide-react';
import { timelineService } from '../services/api';
import { TimelineEvent } from '../types';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const TimelinePage: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [total, setTotal] = useState(0);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  const loadEvents = async () => {
    try {
      const data = await timelineService.list({
        type: selectedType !== 'ALL' ? selectedType : undefined,
        limit: 50,
      });
      setEvents(data.events);
      setTotal(data.total);
    } catch (err) {
      console.error('Error loading timeline:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedType]);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'JOURNAL':
        return <BookOpen className="w-4 h-4 text-purple-400" />;
      case 'CHECKIN':
        return <Activity className="w-4 h-4 text-emerald-400" />;
      case 'GOAL_CREATED':
      case 'GOAL_COMPLETED':
        return <Target className="w-4 h-4 text-brand-400" />;
      case 'PROJECT_CREATED':
      case 'PROJECT_COMPLETED':
        return <FolderKanban className="w-4 h-4 text-sky-400" />;
      case 'TASK_COMPLETED':
        return <CheckSquare className="w-4 h-4 text-amber-400" />;
      case 'DECISION':
        return <GitBranch className="w-4 h-4 text-rose-400" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-400" />;
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando linha do tempo..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <History className="w-4 h-4" />
            <span>Registro Histórico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Linha do Tempo
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Visualize cronologicamente todos os acontecimentos, marcos, decisões e rituais da sua vida.
          </p>
        </div>

        {/* Filter dropdown */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 px-3 py-2 rounded-xl border border-slate-700 focus:outline-none"
          >
            <option value="ALL">Todos os eventos ({total})</option>
            <option value="JOURNAL">Diário</option>
            <option value="CHECKIN">Check-ins</option>
            <option value="GOAL_CREATED">Objetivos</option>
            <option value="PROJECT_CREATED">Projetos</option>
            <option value="TASK_COMPLETED">Tarefas Concluídas</option>
            <option value="DECISION">Decisões</option>
          </select>
        </div>
      </div>

      {/* Timeline Tree */}
      <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {events.length === 0 ? (
          <div className="py-12 text-slate-400 text-sm">Nenhum evento registrado ainda.</div>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="relative group">
              {/* Timeline node */}
              <div className="absolute -left-6 sm:-left-8 top-1.5 w-6 sm:w-8 h-6 sm:h-8 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center group-hover:border-brand-500 transition-colors">
                {getEventIcon(ev.type)}
              </div>

              {/* Event Content */}
              <Card className="p-4 space-y-2 bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-brand-400">
                    {new Date(ev.date).toLocaleDateString('pt-BR', {
                      weekday: 'short',
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                    {ev.type}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-100">{ev.title}</h3>

                {ev.description && (
                  <p className="text-xs text-slate-300 leading-relaxed">{ev.description}</p>
                )}
              </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
