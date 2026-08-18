import React, { useState, useEffect } from 'react';
import { FolderKanban, Plus, Edit2, Trash2, Clock, Target, CheckSquare } from 'lucide-react';
import { projectsService, goalsService, areasService } from '../services/api';
import { Project, Goal, LifeArea } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalId: '',
    areaId: '',
    status: 'ACTIVE',
    progress: 0,
    deadline: '',
  });

  const loadData = async () => {
    try {
      const [projectsData, goalsData, areasData] = await Promise.all([
        projectsService.list(),
        goalsService.list(),
        areasService.list(),
      ]);
      setProjects(projectsData);
      setGoals(goalsData);
      setAreas(areasData);
    } catch (err) {
      console.error('Error loading projects:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingProject(null);
    setFormData({
      title: '',
      description: '',
      goalId: goals[0]?.id || '',
      areaId: areas[0]?.id || '',
      status: 'ACTIVE',
      progress: 0,
      deadline: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (project: Project) => {
    setEditingProject(project);
    setFormData({
      title: project.title,
      description: project.description || '',
      goalId: project.goalId || '',
      areaId: project.areaId || '',
      status: project.status,
      progress: project.progress,
      deadline: project.deadline ? project.deadline.split('T')[0] : '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.goalId) delete payload.goalId;
      if (!payload.areaId) delete payload.areaId;
      if (!payload.deadline) delete payload.deadline;

      if (editingProject) {
        await projectsService.update(editingProject.id, payload);
      } else {
        await projectsService.create(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este projeto?')) return;
    try {
      await projectsService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting project:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando projetos..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider mb-1">
            <FolderKanban className="w-4 h-4" />
            <span>Iniciativas & Projetos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Gerenciador de Projetos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Organize empreitadas complexas com tarefas e metas conectadas.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Projeto
        </Button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((proj) => (
          <Card key={proj.id} className="space-y-4 flex flex-col justify-between bg-slate-900/70 border-slate-800">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge
                  variant={
                    proj.status === 'COMPLETED'
                      ? 'success'
                      : proj.status === 'ACTIVE'
                      ? 'info'
                      : 'default'
                  }
                  size="sm"
                >
                  {proj.status}
                </Badge>
                <span className="text-xs font-bold text-brand-400">{proj.progress}%</span>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{proj.title}</h3>
                {proj.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{proj.description}</p>
                )}
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-sky-500 rounded-full transition-all duration-300"
                  style={{ width: `${proj.progress}%` }}
                />
              </div>

              {proj.goal && (
                <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-800/60 p-2 rounded-lg truncate">
                  <Target className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span className="truncate">{proj.goal.title}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <span>✓ {proj.tasks?.length || 0} tarefas</span>
                {proj.deadline && (
                  <span className="flex items-center gap-1 text-slate-500">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(proj.deadline).toLocaleDateString('pt-BR')}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800/80">
              <button
                onClick={() => handleOpenEdit(proj)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors text-xs font-medium flex items-center gap-1"
              >
                <Edit2 className="w-3.5 h-3.5" /> Editar
              </button>
              <button
                onClick={() => handleDelete(proj.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors text-xs font-medium flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Excluir
              </button>
            </div>
          </Card>
        ))}
      </div>

      {/* Project Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProject ? 'Editar Projeto' : 'Novo Projeto'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título do Projeto"
            placeholder="Ex: Refatoração do Core e Testes Automatizados"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <Textarea
            label="Descrição do Projeto"
            placeholder="Escopo, entregáveis e requisitos principais..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              label="Área da Vida"
              value={formData.areaId}
              onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
            >
              <option value="">Nenhuma</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="PLANNING">Planejamento</option>
              <option value="ACTIVE">Ativo</option>
              <option value="PAUSED">Pausado</option>
              <option value="COMPLETED">Concluído</option>
              <option value="CANCELLED">Cancelado</option>
            </Select>

            <Input
              label="Prazo de Conclusão"
              type="date"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-slate-300">
              <span>Progresso</span>
              <span className="text-sky-400">{formData.progress}%</span>
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingProject ? 'Salvar Alterações' : 'Criar Projeto'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
