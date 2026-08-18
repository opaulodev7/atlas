import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, User, Target, Compass, AlertCircle, Briefcase } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/api';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import { Button } from '../components/ui/Button';

export const OnboardingPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    profession: user?.profile?.profession || '',
    bio: user?.profile?.bio || '', // 1. Quem é você?
    currentSituation: '', // 2. O que está acontecendo atualmente?
    personalGoals: user?.profile?.personalGoals || '', // 3. Quais são seus principais objetivos?
    focusAreas: '', // 4. Quais áreas da sua vida precisam de atenção?
    primaryObstacle: '', // 5. Qual é sua principal dificuldade?
    values: user?.profile?.values || '',
    interests: user?.profile?.interests || '',
    skills: user?.profile?.skills || '',
  });

  const [loading, setLoading] = useState(false);

  const handleNext = () => {
    if (step < 5) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      await profileService.completeOnboarding(formData);
      await refreshUser();
      navigate('/dashboard');
    } catch (err) {
      console.error('Failed to complete onboarding:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-2xl w-full mx-auto z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Configuração Inicial do Seu Atlas
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
            Vamos calibrar o seu contexto
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Essas informações permitirão que a IA do Atlas forneça diagnósticos e planos precisos.
          </p>

          {/* Stepper dots */}
          <div className="flex items-center justify-center gap-2 mt-6">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all duration-300 ${
                  s === step
                    ? 'w-8 bg-brand-500'
                    : s < step
                    ? 'w-2 bg-emerald-400'
                    : 'w-2 bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step Cards */}
        <div className="glass-panel p-6 sm:p-8 rounded-2xl shadow-2xl space-y-6">
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-200">1. Quem é você?</h2>
                  <p className="text-xs text-slate-400">Sua identidade profissional e pessoal</p>
                </div>
              </div>

              <Input
                label="Sua Profissão / Atuação Principal"
                placeholder="Ex: Engenheiro de Software, Médico, Empreendedor, Designer..."
                value={formData.profession}
                onChange={(e) => setFormData({ ...formData, profession: e.target.value })}
              />

              <Textarea
                label="Resumo Pessoal / Bio"
                placeholder="Conte um pouco sobre sua trajetória, o que você valoriza e onde você atua..."
                rows={4}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              />

              <Input
                label="Principais Habilidades Técnicas ou Práticas"
                placeholder="Ex: Liderança, TypeScript, Gestão Financeira, Escrita..."
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-200">2. O que está acontecendo atualmente?</h2>
                  <p className="text-xs text-slate-400">O seu momento de vida presente</p>
                </div>
              </div>

              <Textarea
                label="Descreva seu momento atual"
                placeholder="Ex: Estou em fase de transição de carreira, liderando um projeto crítico, buscando melhorar minha rotina de saúde e focar em projetos pessoais..."
                rows={5}
                value={formData.currentSituation}
                onChange={(e) => setFormData({ ...formData, currentSituation: e.target.value })}
              />
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-200">3. Quais são seus principais objetivos?</h2>
                  <p className="text-xs text-slate-400">As metas prioritárias para os próximos 3 a 12 meses</p>
                </div>
              </div>

              <Textarea
                label="Seus Objetivos Centrais"
                placeholder="Ex: 1. Conquistar promoção para Tech Lead; 2. Correr 10km em menos de 50min; 3. Atingir 50k de reserva financeira..."
                rows={5}
                value={formData.personalGoals}
                onChange={(e) => setFormData({ ...formData, personalGoals: e.target.value })}
              />
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-200">4. Quais áreas da sua vida precisam de atenção?</h2>
                  <p className="text-xs text-slate-400">Onde você sente que há maior desequilíbrio</p>
                </div>
              </div>

              <Textarea
                label="Áreas que necessitam de foco"
                placeholder="Ex: Saúde (sono irregular), Estudos (falta de tempo para leitura profunda) e Rotina (excesso de tempo de tela à noite)..."
                rows={5}
                value={formData.focusAreas}
                onChange={(e) => setFormData({ ...formData, focusAreas: e.target.value })}
              />
            </div>
          )}

          {step === 5 && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-200">5. Qual é sua principal dificuldade atual?</h2>
                  <p className="text-xs text-slate-400">O gargalo que mais drena sua energia ou impede seu avanço</p>
                </div>
              </div>

              <Textarea
                label="Principal Desafio ou Gargalo"
                placeholder="Ex: Troca de contexto constante, falta de um bloco matinal protegido para trabalho focado, procrastinação em decisões complexas..."
                rows={4}
                value={formData.primaryObstacle}
                onChange={(e) => setFormData({ ...formData, primaryObstacle: e.target.value })}
              />

              <Input
                label="Seus Valores Fundamentais (Opcional)"
                placeholder="Ex: Disciplina, clareza, honestidade, excelência, liberdade..."
                value={formData.values}
                onChange={(e) => setFormData({ ...formData, values: e.target.value })}
              />
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            {step > 1 ? (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleBack}
                icon={<ArrowLeft className="w-4 h-4" />}
              >
                Voltar
              </Button>
            ) : (
              <div />
            )}

            {step < 5 ? (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleNext}
                icon={<ArrowRight className="w-4 h-4" />}
              >
                Próximo Passo
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleFinish}
                loading={loading}
                icon={<CheckCircle2 className="w-4 h-4" />}
              >
                Concluir e Abrir Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
