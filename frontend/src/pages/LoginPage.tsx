import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Compass, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao autenticar. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@atlas.io');
    setPassword('password123');
    setError(null);
    setLoading(true);
    try {
      await login('demo@atlas.io', 'password123');
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao acessar conta de demonstração.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-slate-950 font-black shadow-xl shadow-brand-500/20 mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
          Atlas <span className="text-brand-400">OS</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Sistema Operacional Pessoal Inteligente
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel p-8 rounded-2xl shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h2 className="text-lg font-bold text-slate-200">Acessar sua conta</h2>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 bg-brand-500/10 hover:bg-brand-500/20 px-2.5 py-1 rounded-lg border border-brand-500/20 transition-colors"
            >
              Usar Conta Demo ⚡
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              label="Senha"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full mt-2"
              loading={loading}
              icon={<ArrowRight className="w-4 h-4" />}
            >
              Entrar no Atlas
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80">
            Ainda não tem conta?{' '}
            <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 underline">
              Criar conta gratuita
            </Link>
          </div>
        </div>

        {/* Feature badges */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center text-[11px] text-slate-400">
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Privado</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col items-center gap-1">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>IA com Contexto</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/60 flex flex-col items-center gap-1">
            <Compass className="w-4 h-4 text-sky-400" />
            <span>Monólito Modular</span>
          </div>
        </div>
      </div>
    </div>
  );
};
