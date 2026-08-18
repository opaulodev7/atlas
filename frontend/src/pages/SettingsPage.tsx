import React from 'react';
import { Settings, ShieldCheck, Database, Cpu, Sparkles, Terminal, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Settings className="w-4 h-4" />
          <span>Configurações do Sistema</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
          Configurações & Ambiente Atlas
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Gerencie o comportamento do seu monólito modular e integrações de IA.
        </p>
      </div>

      <div className="space-y-6">
        {/* Architecture & Stack Card */}
        <Card className="space-y-4 bg-slate-900/70 border-slate-800">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Arquitetura do Monólito Modular</h2>
              <p className="text-xs text-slate-400">Node.js + Express + Prisma ORM + PostgreSQL + React + Vite</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Backend Server:</span>
              <p className="font-bold text-slate-200 mt-0.5">Express 4.21 (TypeScript)</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Banco de Dados:</span>
              <p className="font-bold text-emerald-400 mt-0.5">PostgreSQL 17 + Prisma</p>
            </div>
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 font-medium">Frontend:</span>
              <p className="font-bold text-sky-400 mt-0.5">React 18 + TailwindCSS</p>
            </div>
          </div>
        </Card>

        {/* AI Integration Card */}
        <Card className="space-y-4 bg-slate-900/70 border-slate-800">
          <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Camada Modular de IA (Atlas AI Engine)</h2>
              <p className="text-xs text-slate-400">Provedores configuráveis via arquivo .env no backend</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            O Atlas suporta conexão com qualquer API compatível com OpenAI (OpenAI, Groq, Anthropic via proxy, Ollama, DeepSeek, LocalAI). Se nenhuma chave de API for fornecida, o Atlas aciona automaticamente seu <strong>motor inteligente de fallback heurístico</strong>, garantindo funcionamento completo e offline.
          </p>

          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 space-y-1 overflow-x-auto">
            <p className="text-slate-500"># Exemplo de configuração em backend/.env</p>
            <p><span className="text-brand-400">AI_PROVIDER</span>="openai"</p>
            <p><span className="text-brand-400">AI_API_KEY</span>="sk-proj-sua-chave-aqui"</p>
            <p><span className="text-brand-400">AI_MODEL</span>="gpt-4o-mini"</p>
            <p><span className="text-brand-400">AI_BASE_URL</span>="https://api.openai.com/v1"</p>
          </div>
        </Card>

        {/* Privacy & Security */}
        <Card className="space-y-3 bg-slate-900/70 border-slate-800">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-200">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Segurança & Privacidade Absoluta</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Nenhuma credencial ou chave secreta é exposta no frontend. Todas as rotas de banco de dados utilizam consultas parametrizadas do Prisma para proteção contra SQL Injection. As senhas de usuário são protegidas com algoritmos de hash criptográfico com salt (bcrypt).
          </p>
        </Card>
      </div>
    </div>
  );
};
