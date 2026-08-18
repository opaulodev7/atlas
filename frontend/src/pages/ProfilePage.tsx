import React, { useState, useEffect } from 'react';
import { User as UserIcon, CheckCircle2, Sparkles, Shield, Save } from 'lucide-react';
import { profileService } from '../services/api';
import { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';

export const ProfilePage: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    profession: user?.profile?.profession || '',
    bio: user?.profile?.bio || '',
    personalGoals: user?.profile?.personalGoals || '',
    values: user?.profile?.values || '',
    interests: user?.profile?.interests || '',
    skills: user?.profile?.skills || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        profession: user.profile?.profession || '',
        bio: user.profile?.bio || '',
        personalGoals: user.profile?.personalGoals || '',
        values: user.profile?.values || '',
        interests: user.profile?.interests || '',
        skills: user.profile?.skills || '',
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSavedSuccess(false);

    try {
      await profileService.updateProfile(formData);
      await refreshUser();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-brand-400 font-bold text-xs uppercase tracking-wider mb-1">
            <UserIcon className="w-4 h-4" />
            <span>Contexto & Identidade</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Perfil Pessoal do Atlas
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Essas informações alimentam os diagnósticos e planos estratégicos da IA.
          </p>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-4 py-2 rounded-xl text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Perfil salvo com sucesso!
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="p-6 sm:p-8 space-y-6 bg-slate-900/70 border-slate-800">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Nome Completo"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              label="Profissão / Posição Atual"
              placeholder="Ex: Tech Lead, Médico, Designer..."
              value={formData.profession}
              onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
            />
          </div>

          <Textarea
            label="Bio & Descrição Geral"
            placeholder="Conte sobre sua trajetória, seu momento presente e suas prioridades..."
            rows={4}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
          />

          <Textarea
            label="Objetivos Pessoais & Visão de Futuro"
            placeholder="Onde você quer chegar nos próximos 1 a 3 anos..."
            rows={3}
            value={formData.personalGoals}
            onChange={(e) => setFormData({ ...formData, personalGoals: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Valores Fundamentais"
              placeholder="Ex: Clareza, disciplina, integridade..."
              value={formData.values}
              onChange={(e) => setFormData({ ...formData, values: e.target.value })}
            />

            <Input
              label="Interesses & Áreas de Curiosidade"
              placeholder="Ex: IA, neurociência, estoicismo..."
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
            />

            <Input
              label="Habilidades & Fortalezas"
              placeholder="Ex: TypeScript, arquitetura, liderança..."
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Seus dados são criptografados e acessados apenas pelo seu usuário.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={loading}
              icon={<Save className="w-4 h-4" />}
            >
              Salvar Alterações
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};
