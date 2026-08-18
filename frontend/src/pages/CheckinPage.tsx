import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, History, Moon, Zap, Target, Dumbbell, Apple, Monitor, MessageSquare, Sparkles } from 'lucide-react';
import { checkinsService } from '../services/api';
import { DailyCheckIn } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ScoreSlider } from '../components/ui/ScoreSlider';
import { Textarea } from '../components/ui/Textarea';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const CheckinPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    mood: 7,
    energy: 7,
    focus: 7,
    sleepHours: 7.5,
    exercise: false,
    nutrition: 7,
    screenTimeHours: 4.0,
    notes: '',
  });

  const [history, setHistory] = useState<DailyCheckIn[]>([]);
  const [averages, setAverages] = useState<any>(null);

  const loadCheckinData = async () => {
    try {
      const todayData = await checkinsService.getToday();
      if (todayData) {
        setFormData({
          mood: todayData.mood,
          energy: todayData.energy,
          focus: todayData.focus,
          sleepHours: todayData.sleepHours,
          exercise: todayData.exercise,
          nutrition: todayData.nutrition,
          screenTimeHours: todayData.screenTimeHours,
          notes: todayData.notes || '',
        });
      }

      const historyData = await checkinsService.getHistory(14);
      setHistory(historyData.history);
      setAverages(historyData.averages);
    } catch (err) {
      console.error('Error loading checkin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckinData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedSuccess(false);

    try {
      await checkinsService.save(formData);
      setSavedSuccess(true);
      await loadCheckinData();
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Error saving checkin:', err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Carregando check-in diário..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Calibração Diária</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Check-in Diário
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Leva menos de 2 minutos para registrar seu estado biométrico e mental de hoje.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Check-in salvo com sucesso!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Container (2 cols) */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6">
            <h2 className="text-base font-bold text-slate-200 border-b border-slate-800 pb-3">
              Métricas de Hoje ({new Date().toLocaleDateString('pt-BR')})
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ScoreSlider
                label="Humor & Bem-estar"
                emoji="😊"
                value={formData.mood}
                onChange={(v) => setFormData({ ...formData, mood: v })}
                lowLabel="Para baixo / Ansioso"
                highLabel="Radiante / Positivo"
              />

              <ScoreSlider
                label="Nível de Energia"
                emoji="⚡"
                value={formData.energy}
                onChange={(e) => setFormData({ ...formData, energy: e })}
                lowLabel="Esgotado"
                highLabel="Pico de Energia"
              />

              <ScoreSlider
                label="Capacidade de Foco"
                emoji="🎯"
                value={formData.focus}
                onChange={(f) => setFormData({ ...formData, focus: f })}
                lowLabel="Disperso"
                highLabel="Hiperfoco / Fluidez"
              />

              <ScoreSlider
                label="Qualidade da Alimentação"
                emoji="🥗"
                value={formData.nutrition}
                onChange={(n) => setFormData({ ...formData, nutrition: n })}
                lowLabel="Desregrada"
                highLabel="Nutritiva / Balanceada"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              {/* Sleep Hours */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Moon className="w-4 h-4 text-sky-400" />
                    Horas de Sono
                  </span>
                  <span className="text-sm font-black text-sky-400">{formData.sleepHours}h</span>
                </div>
                <input
                  type="range"
                  min={3}
                  max={12}
                  step={0.5}
                  value={formData.sleepHours}
                  onChange={(e) => setFormData({ ...formData, sleepHours: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400"
                />
              </div>

              {/* Screen Time */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                    <Monitor className="w-4 h-4 text-amber-400" />
                    Tempo de Tela
                  </span>
                  <span className="text-sm font-black text-amber-400">{formData.screenTimeHours}h</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={14}
                  step={0.5}
                  value={formData.screenTimeHours}
                  onChange={(e) => setFormData({ ...formData, screenTimeHours: parseFloat(e.target.value) })}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              {/* Exercise Boolean */}
              <div className="bg-slate-900/60 border border-slate-800/80 p-4 rounded-xl flex flex-col justify-between">
                <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  Exercício Físico
                </span>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, exercise: !formData.exercise })}
                  className={`mt-2 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                    formData.exercise
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {formData.exercise ? '✓ Sim, treinei hoje!' : 'Não realizei treino'}
                </button>
              </div>
            </div>

            {/* Free Notes */}
            <Textarea
              label="Observações do Dia / Aprendizado Rápido"
              placeholder="O que funcionou hoje? O que atrapalhou seu foco ou energia? Escreva brevemente..."
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />

            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <span className="text-xs text-slate-500">
                Seus check-ins alimentam os diagnósticos de inteligência do Atlas.
              </span>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={saving}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Salvar Check-in
              </Button>
            </div>
          </form>
        </div>

        {/* Stats & History (1 col) */}
        <div className="space-y-6">
          {averages && (
            <Card className="space-y-4">
              <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400" />
                Médias Recentes (14 dias)
              </h3>

              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] text-slate-400">Humor Médio</p>
                  <p className="text-lg font-black text-emerald-400">{averages.avgMood} / 10</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] text-slate-400">Energia Média</p>
                  <p className="text-lg font-black text-amber-400">{averages.avgEnergy} / 10</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] text-slate-400">Foco Médio</p>
                  <p className="text-lg font-black text-sky-400">{averages.avgFocus} / 10</p>
                </div>
                <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
                  <p className="text-[11px] text-slate-400">Média de Sono</p>
                  <p className="text-lg font-black text-purple-400">{averages.avgSleepHours}h</p>
                </div>
              </div>
            </Card>
          )}

          {/* History List */}
          <Card className="space-y-3">
            <h3 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
              <History className="w-4 h-4 text-slate-400" />
              Histórico Recente
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-slate-900/40 border border-slate-800/60 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-300">
                    <span>{item.date}</span>
                    <span className="text-slate-400">
                      Humor: <strong className="text-emerald-400">{item.mood}</strong> | Foco: <strong className="text-sky-400">{item.focus}</strong>
                    </span>
                  </div>
                  {item.notes && (
                    <p className="text-[11px] text-slate-500 italic truncate">"{item.notes}"</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
