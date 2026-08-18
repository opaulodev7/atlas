import React, { useState, useEffect } from 'react';
import { Compass, Plus, Edit2, Trash2, Target, FolderKanban, CheckSquare, Flame } from 'lucide-react';
import { areasService } from '../services/api';
import { LifeArea } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

const PRESET_COLORS = [
  '#3b82f6', // Blue
  '#8b5cf6', // Purple
  '#10b981', // Green
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

export const AreasPage: React.FC = () => {
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<LifeArea | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
  });

  const loadData = async () => {
    try {
      const data = await areasService.list();
      setAreas(data);
    } catch (err) {
      console.error('Error loading areas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingArea(null);
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (a: LifeArea) => {
    setEditingArea(a);
    setFormData({
      name: a.name,
      description: a.description || '',
      color: a.color || '#3b82f6',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingArea) {
        await areasService.update(editingArea.id, formData);
      } else {
        await areasService.create(formData);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving area:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir esta área da vida?')) return;
    try {
      await areasService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting area:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando áreas da vida..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Compass className="w-4 h-4" />
            <span>Estrutura de Vida</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Áreas da Vida
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Mantenha o equilíbrio global categorizando seus objetivos, projetos, hábitos e tarefas.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Nova Área
        </Button>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {areas.map((area) => (
          <Card
            key={area.id}
            className="space-y-4 flex flex-col justify-between bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm"
                  style={{ backgroundColor: `${area.color}25`, color: area.color, border: `1px solid ${area.color}40` }}
                >
                  {area.name.charAt(0)}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(area)}
                    className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(area.id)}
                    className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-slate-100">{area.name}</h3>
                {area.description && (
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{area.description}</p>
                )}
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <Target className="w-3 h-3 text-brand-400" />
                  {area._count?.goals || 0} metas
                </span>
                <span className="flex items-center gap-1">
                  <FolderKanban className="w-3 h-3 text-sky-400" />
                  {area._count?.projects || 0} projetos
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare className="w-3 h-3 text-amber-400" />
                  {area._count?.tasks || 0} tarefas
                </span>
                <span className="flex items-center gap-1">
                  <Flame className="w-3 h-3 text-rose-400" />
                  {area._count?.habits || 0} hábitos
                </span>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Area Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingArea ? 'Editar Área' : 'Nova Área da Vida'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nome da Área"
            placeholder="Ex: Finanças, Criatividade, Saúde..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />

          <Textarea
            label="Descrição do Escopo"
            placeholder="Qual aspecto da sua vida essa área contempla..."
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />

          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
              Cor de Identificação
            </label>
            <div className="flex items-center gap-3">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: c })}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    formData.color === c ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-950' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingArea ? 'Salvar Alterações' : 'Criar Área'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
