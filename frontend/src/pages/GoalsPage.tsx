import React, { useState, useEffect } from 'react';
import { Target, Plus, Edit2, Trash2, Clock, CheckCircle2, AlertCircle, Sparkles, FolderKanban } from 'lucide-react';
import { goalsService, areasService } from '../services/api';
import { Goal, LifeArea } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const GoalsPage: React.FC = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    areaId: '',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    progress: 0,
    deadline: '',
  });

  const loadData = async () => {
    try {
      const [goalsData, areasData] = await Promise.all([
        goalsService.list(),
        areasService.list(),
      ]);
      setGoals(goalsData);
      setAreas(areasData);
    } catch (err) {
      console.error('Error loading goals:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setFormData({
      title: '',
      description: '',
      areaId: areas[0]?.id || '',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      progress: 0,
      deadline: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setFormData({
      title: goal.title,
      description: goal.description || '',
      areaId: goal.areaId || '',
      priority: goal.priority,
      status: goal.status,
      progress: goal.progress,
      deadline: goal.deadline ? goal.deadline.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.areaId) delete payload.areaId;
      if (!payload.deadline) delete payload.deadline;

      if (editingGoal) {
        await goalsService.update(editingGoal.id, payload);
      } else {
        await goalsService.create(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving goal:', err);
    }
  };

  const handleUpdateProgress = async (id: string, newProgress: number) => {
    try {
      await goalsService.updateProgress(id, newProgress);
      loadData();
    } catch (err) {
      console.error('Error updating goal progress:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este objetivo?')) return;
    try {
      await goalsService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting goal:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando objetivos..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Target className="w-4 h-4" />
            <span>Direcionamento Estratégico</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Objetivos de Longo Prazo
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Defina marcos de alta alavancagem e monitore a tração de cada área da sua vida.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Objetivo
        </Button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => (
          <Card key={goal.id} className="space-y-4 flex flex-col justify-between bg-slate-900/70 border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                {goal.area && (
                  <span
                    className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                    style={{ backgroundColor: `${goal.area.color}20`, color: goal.area.color }}
                  >
                    {goal.area.name}
                  </span>
                )}
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      goal.status === 'COMPLETED'
                        ? 'success'
                        : goal.status === 'IN_PROGRESS'
                        ? 'info'
                        : 'default'
                    }
                    size="sm"
                  >
                    {goal.status}
                  </Badge>
                  <Badge
                    variant={
                      goal.priority === 'URGENT' || goal.priority === 'HIGH' ? 'warning' : 'default'
                    }
                    size="sm"
                  >
                    {goal.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{goal.title}</h3>
                {goal.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{goal.description}</p>
                )}
              </div>

              {/* Progress Slider */}
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Progresso</span>
                  <span className="text-brand-400">{goal.progress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={goal.progress}
                  onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value, 10))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
                />
              </div>

              {/* Linked Projects/Tasks count */}
              <div className="flex items-center gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                <span>📂 {goal.projects?.length || 0} projetos</span>
                <span>✓ {goal.tasks?.length || 0} tarefas</span>
                {goal.deadline && (
                  <span className="flex items-center gap-1 text-slate-500 ml-auto">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(goal.deadline).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handleOpenEdit(goal)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                onClick={() => handleDelete(goal.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Goal Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingGoal ? 'Editar Objetivo' : 'Novo Objetivo'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título do Objetivo"
            placeholder="Ex: Conquistar posição de liderança técnica"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Textarea
            label="Descrição & Critérios de Sucesso"
            placeholder="Por que essa meta importa e como você saberá que a atingiu..."
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

            <Select
              label="Prioridade"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
            >
              <option value="LOW">Baixa</option>
              <option value="MEDIUM">Média</option>
              <option value="HIGH">Alta</option>
              <option value="URGENT">Urgente</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="NOT_STARTED">Não Iniciado</option>
              <option value="IN_PROGRESS">Em Andamento</option>
              <option value="COMPLETED">Concluído</option>
              <option value="PAUSED">Pausado</option>
              <option value="CANCELLED">Cancelado</option>
            </Select>

            <Input
              label="Prazo Alvo"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Progresso Inicial</span>
              <span className="text-brand-400">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingGoal ? 'Salvar Alterações' : 'Criar Objetivo'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
