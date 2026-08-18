import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

export const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await register(name, email, password);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao registrar conta. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-slate-950 font-black shadow-xl shadow-brand-500/20 mb-4">
          <Sparkles className="w-7 h-7" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">
          Criar sua conta no <span className="text-brand-400">Atlas</span>
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Inicie sua jornada com um Sistema Operacional Pessoal
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
        <div className="glass-panel p-8 rounded-2xl shadow-2xl space-y-6">
          {error && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Nome Completo"
              placeholder="Como quer ser chamado?"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

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
              placeholder="Mínimo de 6 caracteres"
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
              Criar Conta e Iniciar Onboarding
            </Button>
          </form>

          <div className="pt-2 text-center text-xs text-slate-400 border-t border-slate-800/80">
            Já possui uma conta?{' '}
            <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 underline">
              Fazer login
            </Link>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Seus dados são privados e protegidos por criptografia</span>
        </div>
      </div>
    </div>
  );
};
