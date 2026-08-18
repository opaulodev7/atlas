import React, { useState, useEffect } from 'react';
import { GitBranch, Plus, Edit2, Trash2, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { decisionsService } from '../services/api';
import { Decision } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const DecisionsPage: React.FC = () => {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDecision, setEditingDecision] = useState<Decision | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    context: '',
    decision: '',
    reason: '',
    alternatives: '',
    expectedOutcome: '',
    actualOutcome: '',
    learnings: '',
    date: new Date().toISOString().split('T')[0],
  });

  const loadData = async () => {
    try {
      const data = await decisionsService.list();
      setDecisions(data);
    } catch (err) {
      console.error('Error loading decisions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingDecision(null);
    setFormData({
      title: '',
      context: '',
      decision: '',
      reason: '',
      alternatives: '',
      expectedOutcome: '',
      actualOutcome: '',
      learnings: '',
      date: new Date().toISOString().split('T')[0],
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (d: Decision) => {
    setEditingDecision(d);
    setFormData({
      title: d.title,
      context: d.context,
      decision: d.decision,
      reason: d.reason,
      alternatives: d.alternatives || '',
      expectedOutcome: d.expectedOutcome || '',
      actualOutcome: d.actualOutcome || '',
      learnings: d.learnings || '',
      date: d.date,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDecision) {
        await decisionsService.update(editingDecision.id, formData);
      } else {
        await decisionsService.create(formData);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving decision:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este registro de decisão?')) return;
    try {
      await decisionsService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting decision:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando registro de decisões..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-1">
            <GitBranch className="w-4 h-4" />
            <span>Decisões Estratégicas</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Livro de Decisões
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Registre o contexto e os motivos das suas escolhas para avaliar os resultados posteriormente.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Registrar Decisão
        </Button>
      </div>

      {/* Decisions List */}
      <div className="space-y-6">
        {decisions.length === 0 ? (
          <div className="text-center py-12 text-slate-400 glass-panel rounded-2xl">
            Nenhuma decisão registrada ainda. Documente sua primeira escolha importante hoje!
          </div>
        ) : (
          decisions.map((dec) => (
            <Card key={dec.id} className="space-y-5 bg-slate-900/70 border-slate-800">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                  <Calendar className="w-4 h-4 text-brand-400" />
                  <span>{dec.date}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(dec)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dec.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-100">{dec.title}</h3>
              </div>

              {/* Grid Context */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Contexto da Situação:
                  </span>
                  <p className="text-slate-300">{dec.context}</p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-emerald-400 uppercase tracking-wider text-[10px]">
                    Decisão Tomada:
                  </span>
                  <p className="text-slate-200 font-semibold">{dec.decision}</p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Motivo & Justificativa:
                  </span>
                  <p className="text-slate-300">{dec.reason}</p>
                </div>

                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-1">
                  <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                    Alternativas Consideradas:
                  </span>
                  <p className="text-slate-300">{dec.alternatives || 'Nenhuma registrada'}</p>
                </div>
              </div>

              {/* Review Section */}
              {(dec.actualOutcome || dec.learnings) && (
                <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                  <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px]">
                    Avaliação Retrospectiva & Aprendizados:
                  </span>
                  {dec.actualOutcome && (
                    <p className="text-slate-300">
                      <strong>Resultado Obtido:</strong> {dec.actualOutcome}
                    </p>
                  )}
                  {dec.learnings && (
                    <p className="text-slate-300">
                      <strong>Aprendizado Central:</strong> {dec.learnings}
                    </p>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>

      {/* Decision Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDecision ? 'Editar Decisão' : 'Registrar Nova Decisão'}
        maxWidth="xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título da Decisão"
            placeholder="Ex: Adoção de Monólito Modular com TypeScript e Prisma"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Data da Decisão"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              required
            />

            <Input
              label="Alternativas Consideradas"
              placeholder="Ex: Microsserviços com Docker, Python Flask..."
              value={formData.alternatives}
              onChange={(e) => setFormData({ ...formData, alternatives: e.target.value })}
            />
          </div>

          <Textarea
            label="Contexto da Situação"
            placeholder="O que estava acontecendo que motivou essa escolha..."
            rows={3}
            value={formData.context}
            onChange={(e) => setFormData({ ...formData, context: e.target.value })}
            required
          />

          <Textarea
            label="Decisão Tomada"
            placeholder="Qual foi a escolha exata..."
            rows={2}
            value={formData.decision}
            onChange={(e) => setFormData({ ...formData, decision: e.target.value })}
            required
          />

          <Textarea
            label="Motivo / Por que essa escolha venceu"
            placeholder="Quais foram os argumentos decisivos..."
            rows={2}
            value={formData.reason}
            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-800">
            <Textarea
              label="Resultado Obtido (Revisão posterior)"
              placeholder="O que aconteceu na prática..."
              rows={2}
              value={formData.actualOutcome}
              onChange={(e) => setFormData({ ...formData, actualOutcome: e.target.value })}
            />

            <Textarea
              label="Aprendizado / Lição extraída"
              placeholder="O que você faria igual ou diferente..."
              rows={2}
              value={formData.learnings}
              onChange={(e) => setFormData({ ...formData, learnings: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              {editingDecision ? 'Salvar Alterações' : 'Registrar Decisão'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
