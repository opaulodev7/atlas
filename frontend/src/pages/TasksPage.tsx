import React, { useState, useEffect } from 'react';
import { CheckSquare, Plus, CheckCircle2, Circle, Clock, Filter, Trash2, Edit2, AlertCircle } from 'lucide-react';
import { tasksService, goalsService, projectsService, areasService } from '../services/api';
import { Task, Goal, Project, LifeArea } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalId: '',
    projectId: '',
    areaId: '',
    priority: 'MEDIUM',
    status: 'PENDING',
    deadline: '',
  });

  const loadData = async () => {
    try {
      const [tasksData, goalsData, projectsData, areasData] = await Promise.all([
        tasksService.list(),
        goalsService.list(),
        projectsService.list(),
        areasService.list(),
      ]);
      setTasks(tasksData);
      setGoals(goalsData);
      setProjects(projectsData);
      setAreas(areasData);
    } catch (err) {
      console.error('Error loading tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      description: '',
      goalId: '',
      projectId: '',
      areaId: '',
      priority: 'MEDIUM',
      status: 'PENDING',
      deadline: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      goalId: task.goalId || '',
      projectId: task.projectId || '',
      areaId: task.areaId || '',
      priority: task.priority,
      status: task.status,
      deadline: task.deadline ? task.deadline.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.goalId) delete payload.goalId;
      if (!payload.projectId) delete payload.projectId;
      if (!payload.areaId) delete payload.areaId;
      if (!payload.deadline) delete payload.deadline;

      if (editingTask) {
        await tasksService.update(editingTask.id, payload);
      } else {
        await tasksService.create(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving task:', err);
    }
  };

  const handleToggleTask = async (id: string) => {
    try {
      await tasksService.toggle(id);
      loadData();
    } catch (err) {
      console.error('Error toggling task:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir esta tarefa?')) return;
    try {
      await tasksService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting task:', err);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'PENDING' && t.status === 'COMPLETED') return false;
    if (filterStatus === 'COMPLETED' && t.status !== 'COMPLETED') return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando tarefas..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <CheckSquare className="w-4 h-4" />
            <span>Execução Diária</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Tarefas & Ações
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Transforme prioridades em micro-entregas tangíveis com foco em conclusão.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Nova Tarefa
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800/80">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-300">Filtrar por:</span>

          <div className="flex gap-1.5">
            {['ALL', 'PENDING', 'COMPLETED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filterStatus === st
                    ? 'bg-brand-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {st === 'ALL' ? 'Todas' : st === 'PENDING' ? 'Pendentes' : 'Concluídas'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Prioridade:</span>
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-800 text-xs text-slate-200 px-3 py-1.5 rounded-lg border border-slate-700 focus:outline-none"
          >
            <option value="ALL">Todas as prioridades</option>
            <option value="URGENT">Urgente</option>
            <option value="HIGH">Alta</option>
            <option value="MEDIUM">Média</option>
            <option value="LOW">Baixa</option>
          </select>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-slate-400 glass-panel rounded-2xl">
            Nenhuma tarefa encontrada com os filtros selecionados.
          </div>
        ) : (
          filteredTasks.map((task) => (
            <Card
              key={task.id}
              className={`flex items-center justify-between p-4 transition-all ${
                task.status === 'COMPLETED' ? 'opacity-60 bg-slate-950/40' : 'bg-slate-900/70'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggleTask(task.id)}
                  className="text-slate-500 hover:text-brand-400 transition-colors shrink-0"
                >
                  {task.status === 'COMPLETED' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 fill-emerald-500/20" />
                  ) : (
                    <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                  )}
                </button>

                <div className="min-w-0 space-y-1">
                  <p
                    className={`text-sm font-semibold truncate ${
                      task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-100'
                    }`}
                  >
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-xs text-slate-400 line-clamp-1">{task.description}</p>
                  )}

                  <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-400">
                    {task.area && (
                      <span
                        className="px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: `${task.area.color}20`, color: task.area.color }}
                      >
                        {task.area.name}
                      </span>
                    )}

                    {task.goal && (
                      <span className="text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md truncate max-w-xs">
                        🎯 {task.goal.title}
                      </span>
                    )}

                    {task.deadline && (
                      <span className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(task.deadline).toLocaleDateString('pt-BR')}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions & Priority */}
              <div className="flex items-center gap-3 shrink-0 ml-4">
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

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(task)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? 'Editar Tarefa' : 'Nova Tarefa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título da Tarefa"
            placeholder="Ex: Escrever testes de integração para o auth"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Textarea
            label="Descrição / Detalhes"
            placeholder="O que exatamente precisa ser feito..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <Input
              label="Prazo de Entrega"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
              label="Objetivo Vinculado"
              value={formData.goalId}
              onChange={(e) => setFormData({ ...formData, goalId: e.target.value })}
            >
              <option value="">Nenhum</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title}
                </option>
              ))}
            </Select>

            <Select
              label="Projeto Vinculado"
              value={formData.projectId}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
            >
              <option value="">Nenhum</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingTask ? 'Salvar Alterações' : 'Criar Tarefa'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
