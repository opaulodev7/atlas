import React, { useState, useEffect } from 'react';
import { Flame, Plus, CheckCircle2, Circle, Edit2, Trash2, Calendar, Target, Sparkles } from 'lucide-react';
import { habitsService, areasService } from '../services/api';
import { Habit, LifeArea } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const HabitsPage: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    areaId: '',
    frequency: 'DAILY',
    target: '1x ao dia',
    active: true,
  });

  const loadData = async () => {
    try {
      const [habitsData, areasData] = await Promise.all([
        habitsService.list(),
        areasService.list(),
      ]);
      setHabits(habitsData);
      setAreas(areasData);
    } catch (err) {
      console.error('Error loading habits:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingHabit(null);
    setFormData({
      name: '',
      description: '',
      areaId: areas[0]?.id || '',
      frequency: 'DAILY',
      target: '1x ao dia',
      active: true,
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (habit: Habit) => {
    setEditingHabit(habit);
    setFormData({
      name: habit.name,
      description: habit.description || '',
      areaId: habit.areaId || '',
      frequency: habit.frequency,
      target: habit.target,
      active: habit.active,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingHabit) {
        await habitsService.update(editingHabit.id, formData);
      } else {
        await habitsService.create(formData);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving habit:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este hábito?')) return;
    try {
      await habitsService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting habit:', err);
    }
  };

  const handleToggleDay = async (habitId: string, dateStr: string) => {
    try {
      await habitsService.toggleLog(habitId, dateStr);
      loadData();
    } catch (err) {
      console.error('Error toggling habit date:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando hábitos..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Flame className="w-4 h-4" />
            <span>Rotina & Consistência</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Acompanhamento de Hábitos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Construa sequências inquebráveis e acompanhe sua taxa de execução semanal.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Hábito
        </Button>
      </div>

      {/* Habit Grid */}
      <div className="space-y-4">
        {habits.map((habit) => (
          <Card key={habit.id} className="space-y-4 bg-slate-900/70 border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-bold text-slate-100">{habit.name}</h3>
                  {habit.area && (
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: `${habit.area.color}20`, color: habit.area.color }}
                    >
                      {habit.area.name}
                    </span>
                  )}
                  <span className="text-xs text-slate-400">({habit.target})</span>
                </div>
                {habit.description && (
                  <p className="text-xs text-slate-400">{habit.description}</p>
                )}
              </div>

              {/* Stats & Actions */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black">
                  <Flame className="w-4 h-4" />
                  <span>{habit.currentStreak || 0} dias seguidos</span>
                </div>

                <div className="text-right hidden sm:block">
                  <p className="text-[11px] text-slate-500">Taxa 7 dias</p>
                  <p className="text-sm font-bold text-emerald-400">{habit.rate7Days}%</p>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(habit)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(habit.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* 7-Day History Strip */}
            <div className="pt-3 border-t border-slate-800/80">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Últimos 7 Dias (Clique para registrar)
              </p>

              <div className="grid grid-cols-7 gap-2">
                {habit.weekHistory?.map((day) => {
                  const dateObj = new Date(day.date + 'T12:00:00');
                  const weekday = dateObj.toLocaleDateString('pt-BR', { weekday: 'narrow' });
                  const dayNum = dateObj.getDate();

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => handleToggleDay(habit.id, day.date)}
                      className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all text-xs ${
                        day.completed
                          ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 font-bold'
                          : 'bg-slate-950/60 border-slate-800/80 text-slate-500 hover:border-slate-700'
                      }`}
                    >
                      <span className="text-[10px] text-slate-400 font-normal uppercase">{weekday}</span>
                      <span className="text-xs font-semibold my-0.5">{dayNum}</span>
                      {day.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-700 mt-0.5" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingHabit ? 'Editar Hábito' : 'Novo Hábito'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome do Hábito"
            placeholder="Ex: Leitura 30 min, Corrida matinal, Deep Work..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Descrição & Gatilho de Execução"
            placeholder="Ex: Executar logo após tomar o café da manhã, sem interrupções..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Área da Vida"
              value={formData.areaId}
              onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
            >
              <option value="">Nenhuma / Geral</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>

            <Input
              label="Meta / Alvo"
              placeholder="Ex: 30 minutos, 1x ao dia, 5km..."
              value={formData.target}
              onChange={(e) => setFormData({ ...formData, target: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingHabit ? 'Salvar Alterações' : 'Criar Hábito'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
