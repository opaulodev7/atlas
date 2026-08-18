import React, { useState, useEffect } from 'react';
import { ListOrdered, Plus, CheckCircle2, Circle, Clock, ShieldAlert, Sparkles, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { plansService, goalsService } from '../services/api';
import { Plan, Goal, PlanStep } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Select } from '../components/ui/Select';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    objective: '',
    reason: '',
    expectedResult: '',
    goalId: '',
    indicators: '',
    risks: '',
    contingencyPlan: '',
    status: 'ACTIVE',
    steps: [
      { stepNumber: 1, title: '', timeWindow: '', howToExecute: '', status: 'PENDING' },
    ],
  });

  const loadData = async () => {
    try {
      const [plansData, goalsData] = await Promise.all([
        plansService.list(),
        goalsService.list(),
      ]);
      setPlans(plansData);
      setGoals(goalsData);
      if (plansData.length > 0 && !expandedPlanId) {
        setExpandedPlanId(plansData[0].id);
      }
    } catch (err) {
      console.error('Error loading plans:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      title: '',
      objective: '',
      reason: '',
      expectedResult: '',
      goalId: goals[0]?.id || '',
      indicators: '',
      risks: '',
      contingencyPlan: '',
      status: 'ACTIVE',
      steps: [
        { stepNumber: 1, title: '', timeWindow: 'Segunda-feira 09h00–10h00', howToExecute: '', status: 'PENDING' },
        { stepNumber: 2, title: '', timeWindow: 'Quarta-feira 14h00–15h30', howToExecute: '', status: 'PENDING' },
      ],
    });
    setModalOpen(true);
  };

  const handleAddStepField = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          stepNumber: formData.steps.length + 1,
          title: '',
          timeWindow: 'Sexta-feira 10h00–11h30',
          howToExecute: '',
          status: 'PENDING',
        },
      ],
    });
  };

  const handleRemoveStepField = (index: number) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload: any = { ...formData };
      if (!payload.goalId) delete payload.goalId;

      if (editingPlan) {
        await plansService.update(editingPlan.id, payload);
      } else {
        await plansService.create(payload);
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error saving plan:', err);
    }
  };

  const handleToggleStep = async (planId: string, stepId: string) => {
    try {
      await plansService.toggleStep(planId, stepId);
      loadData();
    } catch (err) {
      console.error('Error toggling step:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Deseja excluir este plano de ação?')) return;
    try {
      await plansService.delete(id);
      loadData();
    } catch (err) {
      console.error('Error deleting plan:', err);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando planos de ação..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <ListOrdered className="w-4 h-4" />
            <span>Ação Estruturada</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Planos de Ação Práticos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Planos cirúrgicos com janelas de tempo, etapas atômicas, indicadores de sucesso e contingência.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={handleOpenCreate}
          icon={<Plus className="w-4 h-4" />}
        >
          Novo Plano de Ação
        </Button>
      </div>

      {/* Plans List */}
      <div className="space-y-6">
        {plans.length === 0 ? (
          <div className="text-center py-12 text-slate-400 glass-panel rounded-2xl">
            Nenhum plano de ação cadastrado ainda. Crie um manualmente ou peça para o <strong>Atlas AI</strong> estruturar um plano para você!
          </div>
        ) : (
          plans.map((plan) => {
            const isExpanded = expandedPlanId === plan.id;
            const completedStepsCount = plan.steps.filter((s) => s.status === 'COMPLETED').length;
            const totalSteps = plan.steps.length;
            const progressPercent = totalSteps > 0 ? Math.round((completedStepsCount / totalSteps) * 100) : 0;

            return (
              <Card key={plan.id} className="space-y-6 bg-slate-900/70 border-slate-800">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-lg font-bold text-slate-100">{plan.title}</h2>
                      <Badge variant="success" size="sm">
                        {plan.status}
                      </Badge>
                      {plan.goal && (
                        <span className="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                          🎯 Meta: {plan.goal.title}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      <strong>Objetivo:</strong> {plan.objective}
                    </p>
                  </div>

                  {/* Actions & Step count */}
                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <p className="text-[11px] text-slate-500">Execução</p>
                      <p className="text-sm font-bold text-brand-400">
                        {completedStepsCount}/{totalSteps} etapas ({progressPercent}%)
                      </p>
                    </div>

                    <button
                      onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Strategy Context Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Motivo / Por quê:
                    </span>
                    <p className="text-slate-300">{plan.reason}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Resultado Esperado:
                    </span>
                    <p className="text-slate-300">{plan.expectedResult}</p>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1">
                    <span className="font-bold text-amber-400 uppercase tracking-wider text-[10px] flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3" /> Riscos & Contingência:
                    </span>
                    <p className="text-slate-300">{plan.contingencyPlan || plan.risks || 'Não especificados'}</p>
                  </div>
                </div>

                {/* Steps Section */}
                {isExpanded && (
                  <div className="space-y-3 pt-2">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Cronograma de Etapas Práticas:
                    </h3>

                    <div className="space-y-2.5">
                      {plan.steps.map((step) => (
                        <div
                          key={step.id}
                          onClick={() => handleToggleStep(plan.id, step.id)}
                          className={`flex items-start justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                            step.status === 'COMPLETED'
                              ? 'bg-emerald-500/5 border-emerald-500/30 opacity-70'
                              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3.5 min-w-0">
                            <button className="mt-0.5 text-emerald-400 shrink-0">
                              {step.status === 'COMPLETED' ? (
                                <CheckCircle2 className="w-5 h-5 fill-emerald-500/20 text-emerald-400" />
                              ) : (
                                <Circle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                              )}
                            </button>

                            <div className="space-y-1 min-w-0">
                              <p
                                className={`text-sm font-bold ${
                                  step.status === 'COMPLETED'
                                    ? 'line-through text-slate-400'
                                    : 'text-slate-200'
                                }`}
                              >
                                Etapa {step.stepNumber}: {step.title}
                              </p>

                              {step.timeWindow && (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded">
                                  <Clock className="w-3 h-3" />
                                  {step.timeWindow}
                                </span>
                              )}

                              {step.howToExecute && (
                                <p className="text-xs text-slate-400 mt-1">
                                  <strong>Como executar:</strong> {step.howToExecute}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>

      {/* Plan Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Novo Plano de Ação Estruturado"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Título do Plano"
            placeholder="Ex: Plano de Execução do MVP Atlas em 14 Dias"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Objetivo Central"
              placeholder="O que será alcançado..."
              value={formData.objective}
              onChange={(e) => setFormData({ ...formData, objective: e.target.value })}
              required
            />

            <Select
              label="Objetivo Geral Vinculado"
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
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Textarea
              label="Motivo & Justificativa"
              placeholder="Por que este plano é prioritário..."
              rows={2}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />

            <Textarea
              label="Resultado Esperado"
              placeholder="O entregável tangível no final..."
              rows={2}
              value={formData.expectedResult}
              onChange={(e) => setFormData({ ...formData, expectedResult: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Indicadores de Sucesso"
              placeholder="Ex: NPS > 85%, 0 bugs críticos..."
              value={formData.indicators}
              onChange={(e) => setFormData({ ...formData, indicators: e.target.value })}
            />

            <Input
              label="Plano de Contingência em caso de Imprevistos"
              placeholder="Ex: Usar janela de sábado das 09h às 11h..."
              value={formData.contingencyPlan}
              onChange={(e) => setFormData({ ...formData, contingencyPlan: e.target.value })}
            />
          </div>

          {/* Steps Dynamic Builder */}
          <div className="space-y-3 pt-2 border-t border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Etapas com Janelas de Tempo:
              </span>
              <Button type="button" variant="outline" size="sm" onClick={handleAddStepField}>
                + Adicionar Etapa
              </Button>
            </div>

            {formData.steps.map((step, idx) => (
              <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                  <span>Etapa {idx + 1}</span>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveStepField(idx)}
                      className="text-rose-400 hover:underline"
                    >
                      Remover
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    placeholder="Título da etapa"
                    value={step.title}
                    onChange={(e) => {
                      const updated = [...formData.steps];
                      updated[idx].title = e.target.value;
                      setFormData({ ...formData, steps: updated });
                    }}
                    required
                  />

                  <Input
                    placeholder="Janela de Tempo (ex: Segunda 19h00–19h30)"
                    value={step.timeWindow}
                    onChange={(e) => {
                      const updated = [...formData.steps];
                      updated[idx].timeWindow = e.target.value;
                      setFormData({ ...formData, steps: updated });
                    }}
                  />
                </div>

                <Input
                  placeholder="Como executar detalhadamente..."
                  value={step.howToExecute}
                  onChange={(e) => {
                    const updated = [...formData.steps];
                    updated[idx].howToExecute = e.target.value;
                    setFormData({ ...formData, steps: updated });
                  }}
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" type="submit">
              Criar Plano de Ação
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
