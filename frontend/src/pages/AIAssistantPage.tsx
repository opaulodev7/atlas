import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  Send,
  Plus,
  Compass,
  AlertTriangle,
  Target,
  BarChart3,
  Flame,
  CheckCircle2,
  ListOrdered,
  Bot,
  User,
  Trash2,
  Clock,
  ShieldCheck,
  Check,
  AlertCircle,
  X,
} from 'lucide-react';
import { aiService, plansService } from '../services/api';
import { AIConversation, AIMessage, SuggestedPlan } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';

const QUICK_PROMPTS = [
  { id: 'analyze', label: '🧭 Analisar Situação Atual', icon: Compass },
  { id: 'diagnose', label: '⚙️ Diagnosticar Gargalos', icon: AlertTriangle },
  { id: 'plan', label: '📋 Criar Plano de Ação', icon: ListOrdered },
  { id: 'prioritize', label: '🎯 O que fazer hoje?', icon: Target },
  { id: 'patterns', label: '🔬 Detectar Padrões', icon: BarChart3 },
  { id: 'review', label: '📊 Revisar Semana', icon: Clock },
  { id: 'reflect', label: '💡 Reflexão 30 Dias', icon: Sparkles },
];

export const AIAssistantPage: React.FC = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  // Suggested Plan Modal & Confirmation State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planFormData, setPlanFormData] = useState<SuggestedPlan | null>(null);
  const [activePlanMessageId, setActivePlanMessageId] = useState<string | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);
  const [planSaveError, setPlanSaveError] = useState<string | null>(null);
  const [savedPlanMessageIds, setSavedPlanMessageIds] = useState<Set<string>>(new Set());
  const [savedSuccessToast, setSavedSuccessToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const list = await aiService.listConversations();
      setConversations(list);
      if (list.length > 0 && !activeConvId) {
        setActiveConvId(list[0].id);
        const fullConv = await aiService.getConversation(list[0].id);
        setMessages(fullConv.messages || []);
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSelectConversation = async (id: string) => {
    setActiveConvId(id);
    try {
      const fullConv = await aiService.getConversation(id);
      setMessages(fullConv.messages || []);
    } catch (err) {
      console.error('Error loading conversation messages:', err);
    }
  };

  const handleNewConversation = () => {
    setActiveConvId(null);
    setMessages([]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || loading) return;

    const userMessage: AIMessage = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setLoading(true);

    try {
      const response = await aiService.chat(text, activeConvId || undefined);
      if (!activeConvId) {
        setActiveConvId(response.conversationId);
      }

      const assistantMsgWithPlan: AIMessage = {
        ...response.assistantMessage,
        suggestedPlan: response.suggestedPlan || null,
      };

      setMessages((prev) => [...prev, assistantMsgWithPlan]);
      await loadConversations();
    } catch (err) {
      console.error('Error in AI chat:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Desculpe, ocorreu uma instabilidade temporária no processamento da resposta.',
          createdAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (actionType: any) => {
    setLoading(true);
    aiService
      .quickAction(actionType)
      .then((response) => {
        if (!activeConvId) {
          setActiveConvId(response.conversationId);
        }

        const assistantMsgWithPlan: AIMessage = {
          ...response.assistantMessage,
          suggestedPlan: response.suggestedPlan || null,
        };

        setMessages((prev) => [...prev, response.userMessage, assistantMsgWithPlan]);
        loadConversations();
      })
      .catch((err) => {
        console.error('Error in AI quick action:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await aiService.deleteConversation(id);
      if (activeConvId === id) {
        handleNewConversation();
      }
      loadConversations();
    } catch (err) {
      console.error('Error deleting conversation:', err);
    }
  };

  // Plan Confirmation Modal Handlers
  const handleOpenPlanModal = (plan: SuggestedPlan, messageId: string) => {
    setPlanFormData({
      title: plan.title || 'Plano de Ação Estratégico',
      objective: plan.objective || '',
      reason: plan.reason || '',
      expectedResult: plan.expectedResult || '',
      indicators: plan.indicators || '',
      risks: plan.risks || '',
      contingencyPlan: plan.contingencyPlan || '',
      steps: (plan.steps || []).map((s, idx) => ({
        stepNumber: s.stepNumber || idx + 1,
        title: s.title || '',
        description: s.description || '',
        timeWindow: s.timeWindow || '',
        howToExecute: s.howToExecute || '',
      })),
    });
    setActivePlanMessageId(messageId);
    setPlanSaveError(null);
    setIsPlanModalOpen(true);
  };

  const handleAddStepToForm = () => {
    if (!planFormData) return;
    setPlanFormData({
      ...planFormData,
      steps: [
        ...planFormData.steps,
        {
          stepNumber: planFormData.steps.length + 1,
          title: '',
          description: '',
          timeWindow: 'Segunda-feira 09h00–10h00',
          howToExecute: '',
        },
      ],
    });
  };

  const handleRemoveStepFromForm = (index: number) => {
    if (!planFormData) return;
    const updated = planFormData.steps.filter((_, i) => i !== index);
    setPlanFormData({
      ...planFormData,
      steps: updated.map((step, idx) => ({ ...step, stepNumber: idx + 1 })),
    });
  };

  const handleConfirmSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planFormData || isSavingPlan) return;

    setIsSavingPlan(true);
    setPlanSaveError(null);

    try {
      const payload = {
        title: planFormData.title.trim(),
        objective: planFormData.objective.trim(),
        reason: planFormData.reason.trim(),
        expectedResult: planFormData.expectedResult.trim(),
        indicators: planFormData.indicators?.trim() || undefined,
        risks: planFormData.risks?.trim() || undefined,
        contingencyPlan: planFormData.contingencyPlan?.trim() || undefined,
        status: 'ACTIVE',
        steps: planFormData.steps.map((step, idx) => ({
          stepNumber: idx + 1,
          title: step.title.trim(),
          description: step.description?.trim() || undefined,
          timeWindow: step.timeWindow?.trim() || undefined,
          howToExecute: step.howToExecute?.trim() || undefined,
          status: 'PENDING',
        })),
      };

      await plansService.create(payload);

      // Mark message plan as saved to prevent duplicates
      if (activePlanMessageId) {
        setSavedPlanMessageIds((prev) => new Set(prev).add(activePlanMessageId));
      }

      setIsPlanModalOpen(false);
      setPlanFormData(null);
      setActivePlanMessageId(null);
      setSavedSuccessToast('Plano de ação salvo e persistido com sucesso no Atlas!');
      setTimeout(() => setSavedSuccessToast(null), 4500);
    } catch (err: any) {
      console.error('Error persisting plan from AI:', err);
      setPlanSaveError(
        err.response?.data?.message || 'Falha ao salvar o plano de ação. Verifique os campos e tente novamente.'
      );
    } finally {
      setIsSavingPlan(false);
    }
  };

  if (initialLoading) {
    return <LoadingSpinner size="lg" text="Carregando Atlas AI..." />;
  }

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-brand-500/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-100 flex items-center gap-2">
              Atlas AI
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-brand-500/20 text-brand-300">
                Estrategista & Diagnóstico
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Transformando seu contexto de vida em diagnóstico, prioridade e planos acionáveis.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccessToast && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{savedSuccessToast}</span>
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleNewConversation}
            icon={<Plus className="w-4 h-4" />}
          >
            Nova Conversa
          </Button>
        </div>
      </div>

      {/* Main Chat Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 min-h-0">
        {/* Sidebar of Conversations (1 col) */}
        <div className="hidden lg:flex flex-col bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 space-y-2 overflow-y-auto">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1">
            Histórico de Conversas
          </p>

          {conversations.length === 0 ? (
            <p className="text-xs text-slate-400 p-2 italic">Nenhuma conversa anterior.</p>
          ) : (
            conversations.map((c) => (
              <div
                key={c.id}
                onClick={() => handleSelectConversation(c.id)}
                className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                  activeConvId === c.id
                    ? 'bg-brand-500/15 border border-brand-500/30 text-brand-200'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                }`}
              >
                <div className="truncate flex-1 min-w-0 pr-2">
                  <p className="truncate font-semibold">{c.title || 'Conversa sem título'}</p>
                  <p className="text-[10px] text-slate-400">
                    {new Date(c.updatedAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <button
                  onClick={(e) => handleDeleteConversation(c.id, e)}
                  className="text-slate-400 hover:text-rose-400 p-1 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Chat Area (3 cols) */}
        <div className="lg:col-span-3 flex flex-col glass-panel rounded-2xl overflow-hidden">
          {/* Quick Prompts Bar */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 overflow-x-auto flex gap-2 shrink-0">
            {QUICK_PROMPTS.map((qp) => (
              <button
                key={qp.id}
                onClick={() => handleQuickPrompt(qp.id)}
                disabled={loading}
                className="text-xs font-semibold whitespace-nowrap bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-slate-300 border border-slate-800 hover:border-brand-500/30 px-3 py-1.5 rounded-lg transition-all active:scale-95 shrink-0"
              >
                {qp.label}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center">
                  <Sparkles className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-200">
                  Como o Atlas pode orientar você hoje?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Eu tenho acesso ao seu perfil, objetivos em andamento, hábitos dos últimos 7 dias, check-ins diários e diário. Faça uma pergunta ou clique em um dos atalhos acima.
                </p>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Apoio de produtividade e organização pessoal (sem diagnósticos clínicos).</span>
                </div>
              </div>
            ) : (
              messages.map((m, idx) => {
                const isSaved = savedPlanMessageIds.has(m.id);

                return (
                  <div
                    key={idx}
                    className={`flex gap-3.5 ${
                      m.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {m.role === 'assistant' && (
                      <div className="w-8 h-8 rounded-xl bg-brand-500/20 border border-brand-500/30 text-brand-300 flex items-center justify-center shrink-0 mt-1">
                        <Bot className="w-4 h-4" />
                      </div>
                    )}

                    <div className="max-w-2xl space-y-3">
                      <div
                        className={`rounded-2xl p-4 text-sm leading-relaxed ${
                          m.role === 'user'
                            ? 'bg-brand-500 text-slate-950 font-medium rounded-tr-none whitespace-pre-wrap'
                            : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none space-y-3'
                        }`}
                      >
                        {m.role === 'assistant' ? (
                          <MarkdownRenderer content={m.content} />
                        ) : (
                          <div>{m.content}</div>
                        )}
                      </div>

                      {/* Actionable Suggested Plan Card */}
                      {m.role === 'assistant' && m.suggestedPlan && (
                        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-brand-500/30 shadow-lg space-y-3 animate-in fade-in">
                          <div className="flex items-center justify-between">
                            <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-400">
                              <ListOrdered className="w-4 h-4 text-brand-400" />
                              Proposta de Plano de Ação
                            </span>
                            <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                              {m.suggestedPlan.steps?.length || 0} etapas sugeridas
                            </span>
                          </div>

                          <div>
                            <h4 className="text-sm font-bold text-slate-100">{m.suggestedPlan.title}</h4>
                            <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                              <strong>Objetivo:</strong> {m.suggestedPlan.objective}
                            </p>
                          </div>

                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">
                              Requer sua confirmação explícita
                            </span>

                            {isSaved ? (
                              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-3 py-1.5 rounded-lg">
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                                <span>Plano Salvo no Atlas</span>
                              </div>
                            ) : (
                              <Button
                                variant="primary"
                                size="sm"
                                onClick={() => handleOpenPlanModal(m.suggestedPlan!, m.id)}
                                icon={<ListOrdered className="w-3.5 h-3.5 text-slate-950" />}
                              >
                                Revisar e Salvar Plano
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {m.role === 'user' && (
                      <div className="w-8 h-8 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-1">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                );
              })
            )}

            {loading && (
              <div className="flex gap-3.5 items-center">
                <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 animate-spin" />
                </div>
                <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl text-xs text-slate-400 font-medium flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  Atlas AI está processando o contexto e gerando a síntese...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/60">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Pergunte ao Atlas AI (ex: Analise meus gargalos atuais ou planeje meus blocos de foco)..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={loading}
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-brand-500 disabled:opacity-50"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputText.trim() || loading}
                icon={<Send className="w-4 h-4" />}
              >
                Enviar
              </Button>
            </form>
          </div>
        </div>
      </div>

      {/* Confirmation & Review Modal for Suggested Plan */}
      {isPlanModalOpen && planFormData && (
        <Modal
          isOpen={isPlanModalOpen}
          onClose={() => !isSavingPlan && setIsPlanModalOpen(false)}
          title="Revisar e Confirmar Plano de Ação da IA"
          maxWidth="2xl"
        >
          <form onSubmit={handleConfirmSavePlan} className="space-y-4">
            {planSaveError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="font-bold">Não foi possível salvar o plano:</p>
                  <p>{planSaveError}</p>
                </div>
              </div>
            )}

            <Input
              label="Título do Plano"
              placeholder="Ex: Plano de Execução Estratégica"
              value={planFormData.title}
              onChange={(e) => setPlanFormData({ ...planFormData, title: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Textarea
                label="Objetivo Central"
                placeholder="O que será alcançado..."
                rows={2}
                value={planFormData.objective}
                onChange={(e) => setPlanFormData({ ...planFormData, objective: e.target.value })}
                required
              />

              <Textarea
                label="Motivo & Justificativa"
                placeholder="Por que este plano é prioritário..."
                rows={2}
                value={planFormData.reason}
                onChange={(e) => setPlanFormData({ ...planFormData, reason: e.target.value })}
                required
              />
            </div>

            <Textarea
              label="Resultado Esperado"
              placeholder="O entregável tangível no final..."
              rows={2}
              value={planFormData.expectedResult}
              onChange={(e) => setPlanFormData({ ...planFormData, expectedResult: e.target.value })}
              required
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Indicadores de Sucesso"
                placeholder="Ex: NPS > 85%, 0 bugs críticos..."
                value={planFormData.indicators || ''}
                onChange={(e) => setPlanFormData({ ...planFormData, indicators: e.target.value })}
              />

              <Input
                label="Plano de Contingência"
                placeholder="Ex: Janela no sábado de manhã..."
                value={planFormData.contingencyPlan || ''}
                onChange={(e) => setPlanFormData({ ...planFormData, contingencyPlan: e.target.value })}
              />
            </div>

            {/* Dynamic Steps Editor */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Etapas com Janelas de Tempo ({planFormData.steps.length}):
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddStepToForm}
                  disabled={isSavingPlan}
                >
                  + Adicionar Etapa
                </Button>
              </div>

              {planFormData.steps.map((step, idx) => (
                <div key={idx} className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                    <span>Etapa {idx + 1}</span>
                    {planFormData.steps.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveStepFromForm(idx)}
                        disabled={isSavingPlan}
                        className="text-rose-400 hover:underline disabled:opacity-50 text-xs"
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
                        const updated = [...planFormData.steps];
                        updated[idx].title = e.target.value;
                        setPlanFormData({ ...planFormData, steps: updated });
                      }}
                      required
                    />

                    <Input
                      placeholder="Janela de Tempo (ex: Segunda 09h00–10h00)"
                      value={step.timeWindow || ''}
                      onChange={(e) => {
                        const updated = [...planFormData.steps];
                        updated[idx].timeWindow = e.target.value;
                        setPlanFormData({ ...planFormData, steps: updated });
                      }}
                    />
                  </div>

                  <Input
                    placeholder="Como executar detalhadamente..."
                    value={step.howToExecute || ''}
                    onChange={(e) => {
                      const updated = [...planFormData.steps];
                      updated[idx].howToExecute = e.target.value;
                      setPlanFormData({ ...planFormData, steps: updated });
                    }}
                  />
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-[11px] text-slate-500">
                O plano será persistido no seu banco de dados.
              </span>

              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  disabled={isSavingPlan}
                >
                  Cancelar
                </Button>
                <Button
                  variant="primary"
                  type="submit"
                  loading={isSavingPlan}
                  icon={<Check className="w-4 h-4" />}
                >
                  Confirmar e Salvar Plano
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
