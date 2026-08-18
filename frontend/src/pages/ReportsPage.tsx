import React, { useState, useEffect } from 'react';
import { BarChart3, Sparkles, RefreshCw, Calendar, CheckSquare, Flame, Activity, ShieldCheck, Download } from 'lucide-react';
import { reportsService } from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { MarkdownRenderer } from '../components/ui/MarkdownRenderer';

export const ReportsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadReport = async () => {
    try {
      const data = await reportsService.getWeeklyReport();
      setReport(data);
    } catch (err) {
      console.error('Error generating report:', err);
    } finally {
      setLoading(false);
      setGenerating(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleRegenerate = () => {
    setGenerating(true);
    loadReport();
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="Compilando métricas e gerando relatório semanal com Atlas AI..." />;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <BarChart3 className="w-4 h-4" />
            <span>Retrospectiva & Síntese</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Relatório Retrospectivo Semanal
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Análise aprofundada baseada no método: Fato → Interpretação → Hipótese → Recomendação.
          </p>
        </div>

        <Button
          variant="outline"
          size="md"
          onClick={handleRegenerate}
          loading={generating}
          icon={<RefreshCw className="w-4 h-4" />}
        >
          Atualizar Relatório
        </Button>
      </div>

      {report && (
        <>
          {/* Period & High-level Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="space-y-1 bg-slate-900/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Período Analisado
              </span>
              <p className="text-sm font-bold text-slate-100 flex items-center gap-1.5 pt-1">
                <Calendar className="w-4 h-4 text-brand-400" />
                {report.period?.startDate} a {report.period?.endDate}
              </p>
            </Card>

            <Card className="space-y-1 bg-slate-900/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Tarefas Concluídas
              </span>
              <p className="text-2xl font-black text-brand-400 flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-brand-400" />
                {report.metrics?.tasksCompletedCount}
              </p>
            </Card>

            <Card className="space-y-1 bg-slate-900/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Aderência aos Hábitos
              </span>
              <p className="text-2xl font-black text-amber-400 flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                {report.metrics?.overallHabitRate}%
              </p>
            </Card>

            <Card className="space-y-1 bg-slate-900/60">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Check-ins & Sono Médio
              </span>
              <p className="text-2xl font-black text-sky-400 flex items-center gap-2">
                <Activity className="w-5 h-5 text-sky-400" />
                {report.metrics?.avgSleep}h <span className="text-xs text-slate-500 font-normal">/ noite</span>
              </p>
            </Card>
          </div>

          {/* AI Cognitive Synthesis Breakdown */}
          <Card className="p-6 sm:p-8 space-y-6 bg-slate-900/80 border-brand-500/20">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brand-400" />
                <h2 className="text-lg font-bold text-slate-100">
                  Síntese Analítica Oficial do Atlas
                </h2>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-300 border border-brand-500/20">
                Cognitive Matrix v1.0
              </span>
            </div>

            {/* Markdown rendered text */}
            <div className="text-sm leading-relaxed text-slate-200">
              <MarkdownRenderer content={report.synthesis} />
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Distinção estrita entre Fatos, Interpretações, Hipóteses e Recomendações.</span>
              </div>
              <span>Atlas Retrospective Engine</span>
            </div>
          </Card>
        </>
      )}
    </div>
  );
};
