import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function getPastDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main() {
  console.log('🌱 Iniciando seed do banco de dados Atlas...');

  // Clean existing demo user if present
  const existingUser = await prisma.user.findUnique({
    where: { email: 'demo@atlas.io' },
  });

  if (existingUser) {
    console.log('Limpando dados anteriores do usuário demo...');
    await prisma.user.delete({ where: { id: existingUser.id } });
  }

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('password123', salt);

  // 1. Create Demo User & Profile
  const user = await prisma.user.create({
    data: {
      name: 'Alexandre Silva',
      email: 'demo@atlas.io',
      passwordHash,
      profile: {
        create: {
          profession: 'Tech Lead & Engenheiro de Software',
          bio: 'Profissional com 7 anos de experiência em engenharia de software, focado em liderança técnica, arquitetura de sistemas distribuídos e alta performance sustentável.',
          personalGoals: 'Construir produtos digitais com impacto real, alcançar autonomia financeira e manter saúde física e clareza mental no mais alto nível.',
          values: 'Pragmatismo, integridade, melhoria contínua, foco essencialista e clareza de pensamento.',
          interests: 'Arquitetura de software, inteligência artificial, neurociência do foco, corrida de rua e estoicismo.',
          skills: 'TypeScript, Node.js, React, PostgreSQL, Arquitetura de Sistemas, Liderança de Times Técnicos.',
          onboardingCompleted: true,
        },
      },
    },
  });

  console.log(`👤 Usuário Demo criado: ${user.email} (Senha: password123)`);

  // 2. Create Life Areas
  const areasData = [
    { name: 'Carreira', description: 'Trabalho, liderança técnica, posicionamento profissional e impacto.', color: '#3b82f6', icon: 'Briefcase' },
    { name: 'Estudos', description: 'Leitura especializada, aprendizado contínuo e aprofundamento técnico.', color: '#8b5cf6', icon: 'GraduationCap' },
    { name: 'Finanças', description: 'Reserva de emergência, controle de fluxo de caixa e investimentos.', color: '#10b981', icon: 'DollarSign' },
    { name: 'Saúde', description: 'Treinamento físico, corrida, higiene do sono e nutrição balanceada.', color: '#ef4444', icon: 'Heart' },
    { name: 'Projetos', description: 'Iniciativas autorais, MVP Atlas e projetos de código aberto.', color: '#f59e0b', icon: 'FolderKanban' },
    { name: 'Relacionamentos', description: 'Família, mentoria, amigos próximos e networking estratégico.', color: '#ec4899', icon: 'Users' },
    { name: 'Desenvolvimento Pessoal', description: 'Autoconhecimento, foco, gestão emocional e rituais diários.', color: '#6366f1', icon: 'Sparkles' },
    { name: 'Rotina', description: 'Organização do lar, descompressão, administração e descanso.', color: '#14b8a6', icon: 'Clock' },
  ];

  const createdAreas: Record<string, string> = {};

  for (const a of areasData) {
    const area = await prisma.lifeArea.create({
      data: {
        userId: user.id,
        name: a.name,
        description: a.description,
        color: a.color,
        icon: a.icon,
      },
    });
    createdAreas[a.name] = area.id;
  }

  // 3. Create Goals
  const goal1 = await prisma.goal.create({
    data: {
      userId: user.id,
      areaId: createdAreas['Carreira'],
      title: 'Consolidação como Tech Lead Estratégico',
      description: 'Evoluir o nível de mentoria do time, elevar a qualidade arquitetural do produto e liderar decisões tecnológicas chave.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      progress: 65,
      deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  const goal2 = await prisma.goal.create({
    data: {
      userId: user.id,
      areaId: createdAreas['Projetos'],
      title: 'Lançar a Versão 1.0 do Atlas Personal OS',
      description: 'Construir um monólito modular completo com React, Node, Prisma e IA para gestão de vida de alta performance.',
      priority: 'URGENT',
      status: 'IN_PROGRESS',
      progress: 85,
      deadline: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
    },
  });

  const goal3 = await prisma.goal.create({
    data: {
      userId: user.id,
      areaId: createdAreas['Saúde'],
      title: 'Completar Prova de 10km em Sub-50 Minutos',
      description: 'Estruturar planilha de 3 treinos de corrida por semana, fortalecimento e recuperação monitorada no check-in.',
      priority: 'MEDIUM',
      status: 'IN_PROGRESS',
      progress: 50,
      deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
    },
  });

  const goal4 = await prisma.goal.create({
    data: {
      userId: user.id,
      areaId: createdAreas['Finanças'],
      title: 'Atingir R$ 50.000 em Reserva de Emergência e Ativos',
      description: 'Manter aportes mensais consistentes de R$ 2.500 em renda fixa pós-fixada e ETFs.',
      priority: 'HIGH',
      status: 'IN_PROGRESS',
      progress: 72,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    },
  });

  // 4. Create Projects
  const proj1 = await prisma.project.create({
    data: {
      userId: user.id,
      goalId: goal2.id,
      areaId: createdAreas['Projetos'],
      title: 'Desenvolvimento do Núcleo Atlas (Front + Back + IA)',
      description: 'Arquitetura modular, testes automatizados e interface fluida com dashboard integrado.',
      status: 'ACTIVE',
      progress: 80,
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
  });

  const proj2 = await prisma.project.create({
    data: {
      userId: user.id,
      goalId: goal1.id,
      areaId: createdAreas['Carreira'],
      title: 'Framework de Mentoria e One-on-Ones para o Time',
      description: 'Criação de templates de feedback contínuo e matriz de competências técnicas.',
      status: 'ACTIVE',
      progress: 60,
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  // 5. Create Tasks
  const tasksData = [
    { title: 'Revisar PRs prioritários e destravar deploy de produção', priority: 'URGENT', status: 'PENDING', areaId: createdAreas['Carreira'], goalId: goal1.id, deadline: new Date() },
    { title: 'Finalizar integração do módulo de IA no Atlas', priority: 'URGENT', status: 'IN_PROGRESS', areaId: createdAreas['Projetos'], projectId: proj1.id, deadline: new Date() },
    { title: 'Treino de corrida intervalada: 6x 800m no ritmo alvo', priority: 'HIGH', status: 'PENDING', areaId: createdAreas['Saúde'], goalId: goal3.id, deadline: new Date() },
    { title: 'Aporte mensal programado da reserva financeira', priority: 'HIGH', status: 'COMPLETED', areaId: createdAreas['Finanças'], goalId: goal4.id, deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
    { title: 'Leitura de 2 capítulos do livro "Designing Data-Intensive Applications"', priority: 'MEDIUM', status: 'COMPLETED', areaId: createdAreas['Estudos'], deadline: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { title: 'Planejar pauta da sessão de alinhamento com a diretoria', priority: 'MEDIUM', status: 'PENDING', areaId: createdAreas['Carreira'], goalId: goal1.id, deadline: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) },
    { title: 'Organizar ambiente de trabalho e limpar mesa para o foco semanal', priority: 'LOW', status: 'COMPLETED', areaId: createdAreas['Rotina'], deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ];

  for (const t of tasksData) {
    await prisma.task.create({
      data: {
        userId: user.id,
        title: t.title,
        priority: t.priority,
        status: t.status,
        areaId: t.areaId,
        goalId: t.goalId,
        projectId: t.projectId,
        deadline: t.deadline,
        completedAt: t.status === 'COMPLETED' ? new Date() : null,
      },
    });
  }

  // 6. Create Habits
  const habitsData = [
    { name: 'Leitura Estratégica (30 min)', description: 'Livros de arquitetura, liderança e modelos mentais', areaId: createdAreas['Estudos'], target: '30 min' },
    { name: 'Treino Físico / Corrida', description: 'Musculação ou treino aeróbico com monitoramento', areaId: createdAreas['Saúde'], target: '45 min' },
    { name: 'Bloco de Deep Work Matinal', description: 'Trabalho focado sem notificações das 08h30 às 10h30', areaId: createdAreas['Desenvolvimento Pessoal'], target: '2 horas' },
    { name: 'Check-in e Fechamento no Atlas', description: 'Registrar humor, energia, sono e aprendizado do dia', areaId: createdAreas['Rotina'], target: '5 min' },
  ];

  const createdHabits: any[] = [];
  for (const h of habitsData) {
    const habit = await prisma.habit.create({
      data: {
        userId: user.id,
        name: h.name,
        description: h.description,
        areaId: h.areaId,
        frequency: 'DAILY',
        target: h.target,
        active: true,
      },
    });
    createdHabits.push(habit);
  }

  // 7. Seed 14 Days of Habit Logs & Daily Checkins
  for (let i = 13; i >= 0; i--) {
    const dateStr = getPastDate(i);

    // Habit logs
    for (const habit of createdHabits) {
      // 85% completion rate simulation
      const completed = i === 4 || i === 9 ? Math.random() > 0.4 : true;
      await prisma.habitLog.create({
        data: {
          habitId: habit.id,
          userId: user.id,
          date: dateStr,
          completed,
        },
      });
    }

    // Daily check-in
    const sleep = i === 3 ? 5.8 : i === 7 ? 6.2 : 7.5;
    const mood = sleep < 6.5 ? 6 : 8;
    const energy = sleep < 6.5 ? 5 : 8;
    const focus = sleep < 6.5 ? 6 : 9;

    await prisma.dailyCheckIn.create({
      data: {
        userId: user.id,
        date: dateStr,
        mood,
        energy,
        focus,
        sleepHours: sleep,
        exercise: i % 2 === 0,
        nutrition: 8,
        screenTimeHours: 4.5,
        notes: i === 0
          ? 'Dia de alta clareza mental. Bloco de Deep Work no Atlas rendeu excelente tração.'
          : i === 3
          ? 'Noite de sono mais curta devido a uma emergência técnica. Energia moderada à tarde.'
          : 'Rotina executada com fluidez e bom nível de foco.',
      },
    });
  }

  // 8. Create Journal Entries
  await prisma.journalEntry.create({
    data: {
      userId: user.id,
      areaId: createdAreas['Desenvolvimento Pessoal'],
      title: 'A Lei do Foco Essencialista e Redução de Ruído',
      content: 'Hoje percebi com muita clareza que quando inicio o dia sem olhar notificações nos primeiros 90 minutos, minha capacidade de resolver problemas de arquitetura complexa triplica. O estado de fluxo não é sorte, é uma condição de ambiente construída intencionalmente.',
      date: getPastDate(1),
      mood: 9,
      tags: 'foco, deepwork, produtividade',
    },
  });

  await prisma.journalEntry.create({
    data: {
      userId: user.id,
      areaId: createdAreas['Carreira'],
      title: 'Transição da Execução Individual para Alavancagem de Time',
      content: 'Como Tech Lead, meu maior valor não é escrever todo o código sozinho, mas criar clareza técnica e autonomia para que todos os engenheiros desenvolvam com velocidade e segurança. As sessões de arquitetura aberta têm gerado muito engajamento.',
      date: getPastDate(4),
      mood: 8,
      tags: 'lideranca, gestao, arquitetura',
    },
  });

  // 9. Create Decisions
  await prisma.decision.create({
    data: {
      userId: user.id,
      title: 'Adoção de Monólito Modular com TypeScript e Prisma',
      context: 'Precisávamos de velocidade de iteração no MVP sem abrir mão de tipagem estrita de ponta a ponta e escalabilidade futura.',
      decision: 'Utilizar monólito modular com Node.js, Express, React, TypeScript e Prisma ORM, evitando overengineering de microsserviços.',
      reason: 'Reduz drásticamente a complexidade operacional, facilita testes e permite refatorações seguras.',
      alternatives: 'Microsserviços com Docker/K8s ou arquitetura Serverless fragmentada.',
      expectedOutcome: 'Lançar o MVP completo em semanas com código limpo e de fácil manutenção.',
      actualOutcome: 'Desenvolvimento extremamente fluido com validação rápida e zero gargalos de infraestrutura.',
      learnings: 'A simplicidade arquitetural no início de um projeto é o maior multiplicador de velocidade.',
      date: getPastDate(8),
      reviewedAt: new Date(),
    },
  });

  await prisma.decision.create({
    data: {
      userId: user.id,
      title: 'Instituir Bloco Inegociável de Deep Work Matinal',
      context: 'Interrupções frequentes no início do dia estavam fragmentando a concentração em tarefas críticas.',
      decision: 'Bloquear a agenda das 08h30 às 10h30 de segunda a quinta exclusivamente para trabalho profundo.',
      reason: 'A energia cognitiva está no pico e o custo de troca de contexto é devastador para código e arquitetura.',
      alternatives: 'Trabalhar até tarde da noite para compensar o dia.',
      expectedOutcome: 'Aumento de 50% na velocidade de entrega dos marcos técnicos prioritários.',
      actualOutcome: 'Ganhos substanciais de foco e redução de estresse no fim do dia.',
      learnings: 'Proteger a manhã é proteger o futuro dos projetos.',
      date: getPastDate(12),
      reviewedAt: new Date(),
    },
  });

  // 10. Create Action Plan
  await prisma.plan.create({
    data: {
      userId: user.id,
      goalId: goal1.id,
      title: 'Plano de Aceleração para Liderança Técnica de Alto Impacto',
      objective: 'Elevar a maturidade dos processos de engenharia e estruturar o roadmap técnico trimestral.',
      reason: 'Garantir alinhamento entre visão de produto e sustentabilidade arquitetural do código.',
      expectedResult: 'Redução de retrabalho no time e aumento da velocidade de entrega com padrão de excelência.',
      deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      indicators: 'NPS interno de engenharia > 85%, Cobertura de testes > 80%, 0 incidentes críticos em prod.',
      risks: 'Sobrecarga com demandas emergenciais de produto e reuniões excessivas.',
      contingencyPlan: 'Proteger rigidamente as tardes de terça e quinta para arquitetura e documentação.',
      status: 'ACTIVE',
      steps: {
        create: [
          {
            stepNumber: 1,
            title: 'Mapeamento de Débitos Técnicos Críticos',
            description: 'Levantar com o time os 5 principais gargalos de código e banco de dados.',
            timeWindow: 'Segunda-feira: 09h00–10h30',
            howToExecute: 'Reunir métricas de erro no log e conduzir sessão de 45 min com os seniores.',
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          },
          {
            stepNumber: 2,
            title: 'Definição de Padrões de Design e DTOs',
            description: 'Padronizar validação com Zod e tipagem TypeScript compartilhada.',
            timeWindow: 'Quarta-feira: 14h00–16h00',
            howToExecute: 'Escrever RFC técnica e disponibilizar exemplo no repositório.',
            status: 'COMPLETED',
            completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          },
          {
            stepNumber: 3,
            title: 'Implantação de Testes de Integração Automatizados',
            description: 'Cobrir autenticação, fluxos de CRUD e rotas da API com Jest e Supertest.',
            timeWindow: 'Sexta-feira: 10h00–12h00',
            howToExecute: 'Criar suíte de testes com banco de dados em memória ou sandbox.',
            status: 'PENDING',
          },
          {
            stepNumber: 4,
            title: 'Retrospectiva e Apresentação dos Resultados',
            description: 'Demonstrar ganhos de produtividade e estabilidade para a liderança executiva.',
            timeWindow: 'Próxima Sexta-feira: 16h00–17h00',
            howToExecute: 'Apresentar relatório semanal do Atlas com gráficos de progresso.',
            status: 'PENDING',
          },
        ],
      },
    },
  });

  // 11. Create Timeline Events
  const timelineEvents = [
    { type: 'CUSTOM', title: 'Boas-vindas ao Atlas!', description: 'Conta criada e onboarding inicial finalizado com sucesso.', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
    { type: 'GOAL_CREATED', title: 'Novo Objetivo: Consolidação como Tech Lead', description: 'Definido como prioridade de Carreira.', date: new Date(Date.now() - 13 * 24 * 60 * 60 * 1000) },
    { type: 'DECISION', title: 'Decisão: Instituir Bloco Inegociável de Deep Work Matinal', description: 'Rotina protegida das 08h30 às 10h30.', date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000) },
    { type: 'PROJECT_CREATED', title: 'Novo Projeto: Desenvolvimento do Núcleo Atlas', description: 'Monólito modular TypeScript.', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
    { type: 'DECISION', title: 'Decisão: Adoção de Monólito Modular com TypeScript e Prisma', description: 'Arquitetura simplificada e robusta.', date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000) },
    { type: 'JOURNAL', title: 'Diário: Transição da Execução Individual para Alavancagem', description: 'Reflexões sobre liderança técnica.', date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
    { type: 'CHECKIN', title: 'Check-in Diário', description: 'Humor: 9/10 | Energia: 8/10 | Foco: 9/10 | Sono: 7.5h', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    { type: 'JOURNAL', title: 'Diário: A Lei do Foco Essencialista e Redução de Ruído', description: 'Constatação do impacto de 90min sem notificações.', date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
  ];

  for (const ev of timelineEvents) {
    await prisma.timelineEvent.create({
      data: {
        userId: user.id,
        type: ev.type,
        title: ev.title,
        description: ev.description,
        date: ev.date,
      },
    });
  }

  console.log('✅ Seed executado com sucesso! Dados fictícios e consistentes carregados.');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
