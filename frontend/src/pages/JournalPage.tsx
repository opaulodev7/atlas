import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Search, Edit2, Trash2, Calendar, Smile, Tag, Sparkles } from 'lucide-react';
import { journalService, areasService } from '../services/api';
import { JournalEntry, LifeArea } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const JournalPage: React.FC = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [areas, setAreas] = useState<LifeArea[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArea, setSelectedArea] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    date: new Date().toISOString().split('T')[0],
    mood: 8,
    areaId: '',
    tags: '',
  });

  const loadData = async () => {
    try {
      const [journalData, areasData] = await Promise.all([
        journalService.list({ search: searchTerm || undefined, areaId: selectedArea || undefined }),
        areasService.list(),
      ]);
      setEntries(journalData);
      setAreas(areasData);
    } catch (err) {
      console.error('Error loading journal:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedArea]);

  const handleOpenCreate = () => {
    setEditingEntry(null);
    setFormData({
      title: '',
      content: '',
      date: new Date().toISOString().split('T')[0],
      mood: 8,
      areaId: areas[0]?.id || '',
      tags: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormData({
      title: entry.title || '',
      content: entry.content,
      date: entry.date,
      mood: entry.mood || 8,
      areaId: entry.areaId || '',
      tags: entry.tags || '',
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.areaId) delete payload.areaId;

      if (editingEntry) {
        await journalService.update(editingEntry.id, payload);
      } else {
        await journalService.create(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving journal entry:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir esta reflexão do diário?')) return;
    try {
      await journalService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting journal entry:', err);
    }
  };

  if (loading && entries.length === 0) {
    return <LoadingSpinner size="lg" text="Carregando diário..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Reflexão & Autoconhecimento</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Diário Pessoal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registre acontecimentos, reflexões diárias, modelos mentais e aprendizados.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Escrever no Diário
        </Button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por palavras-chave ou tags no diário..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-brand-500"
          />
        </div>

        <div className="w-full sm:w-64">
          <Select
            value={selectedArea}
            onChange={(e) => setSelectedArea(e.target.value)}
          >
            <option value="">Todas as áreas</option>
            {areas.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Entries Feed */}
      <div className="space-y-6">
        {entries.length === 0 ? (
          <div className="text-center py-12 text-slate-400 glass-panel rounded-2xl">
            Nenhuma entrada no diário encontrada. Comece escrevendo sua primeira reflexão de hoje!
          </div>
        ) : (
          entries.map((entry) => (
            <Card key={entry.id} className="space-y-4 bg-slate-900/70 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                    <Calendar className="w-4 h-4 text-brand-400" />
                    <span>{entry.date}</span>
                  </div>

                  {entry.mood !== null && entry.mood !== undefined && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-amber-300 font-medium">
                      Humor: {entry.mood}/10
                    </span>
                  )}

                  {entry.area && (
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-full font-semibold"
                      style={{ backgroundColor: `${entry.area.color}20`, color: entry.area.color }}
                    >
                      {entry.area.name}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(entry)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {entry.title && (
                <h3 className="text-lg font-bold text-slate-100">{entry.title}</h3>
              )}

              {/* Content */}
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {entry.content}
              </p>

              {/* Tags */}
              {entry.tags && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60 text-xs text-slate-500">
                  <Tag className="w-3.5 h-3.5 text-slate-500" />
                  <span>{entry.tags}</span>
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Entry Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEntry ? 'Editar Entrada no Diário' : 'Nova Entrada no Diário'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título (Opcional)"
            placeholder="Ex: A Lei do Foco Essencialista e Redução de Ruído"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Data"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Select
              label="Área Relacionada"
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
              label="Humor (0-10)"
              type="number"
              min={0}
              max={10}
              value={formData.mood}
              onChange={(e) => setFormData({ ...formData, mood: parseInt(e.target.value, 10) })}
            />
          </div>

          <Textarea
            label="Conteúdo da Reflexão"
            placeholder="Escreva livremente sobre seus pensamentos, ideias, desafios superados..."
            rows={8}
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            required
          />

          <Input
            label="Tags (separadas por vírgula)"
            placeholder="Ex: foco, lideranca, aprendizado, habitos"
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingEntry ? 'Salvar Alterações' : 'Salvar no Diário'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
