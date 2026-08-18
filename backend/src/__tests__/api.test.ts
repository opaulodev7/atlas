import request from 'supertest';
import app from '../app';
import { prisma } from '../prisma/client';

describe('Atlas API Automated Test Suite', () => {
  let authToken = '';
  let userId = '';

  beforeAll(async () => {
    // Authenticate with seeded user
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'demo@atlas.io',
        password: 'password123',
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toBeDefined();
    authToken = res.body.data.token;
    userId = res.body.data.user.id;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('should return status ok', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });
  });

  describe('Authentication Module', () => {
    it('should get current authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('demo@atlas.io');
      expect(res.body.data.profile).toBeDefined();
    });

    it('should register a new user successfully', async () => {
      const testEmail = `test_${Date.now()}@atlas.io`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Novo Usuário',
          email: testEmail,
          password: 'securepassword123',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe(testEmail);
    });

    it('should reject unauthorized request without token', async () => {
      const res = await request(app).get('/api/dashboard/summary');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Dashboard Module', () => {
    it('should fetch complete dashboard summary', async () => {
      const res = await request(app)
        .get('/api/dashboard/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.greeting).toBeDefined();
      expect(res.body.data.activeGoals).toBeDefined();
      expect(res.body.data.pendingTasks).toBeDefined();
      expect(res.body.data.habits).toBeDefined();
      expect(res.body.data.insight).toBeDefined();
    });
  });

  describe('Life Areas Module', () => {
    it('should list all life areas', async () => {
      const res = await request(app)
        .get('/api/areas')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(8);
    });

    it('should create a custom life area', async () => {
      const res = await request(app)
        .post('/api/areas')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Criatividade & Artes',
          description: 'Música, escrita criativa e hobbies visuais',
          color: '#ec4899',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Criatividade & Artes');
    });
  });

  describe('Goals & Projects Module', () => {
    let createdGoalId = '';

    it('should create a new goal', async () => {
      const res = await request(app)
        .post('/api/goals')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Aprender Rust para Sistemas de Baixa Latência',
          description: 'Estudo prático de memory safety e concorrência sem garbage collection',
          priority: 'HIGH',
          status: 'NOT_STARTED',
          progress: 0,
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      createdGoalId = res.body.data.id;
    });

    it('should update goal progress', async () => {
      const res = await request(app)
        .patch(`/api/goals/${createdGoalId}/progress`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          progress: 25,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.progress).toBe(25);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });
  });

  describe('Tasks Module', () => {
    let createdTaskId = '';

    it('should create a task', async () => {
      const res = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Configurar pipeline de CI/CD para deploy contínuo',
          priority: 'URGENT',
          status: 'PENDING',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.id).toBeDefined();
      createdTaskId = res.body.data.id;
    });

    it('should toggle task completion', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${createdTaskId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });

  describe('Habits Module', () => {
    it('should list habits with streaks and 7-day adherence', async () => {
      const res = await request(app)
        .get('/api/habits')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data[0].weekHistory).toBeDefined();
    });

    it('should log habit completion for today', async () => {
      const habitsRes = await request(app)
        .get('/api/habits')
        .set('Authorization', `Bearer ${authToken}`);

      const firstHabit = habitsRes.body.data[0];
      const today = new Date().toISOString().split('T')[0];

      const res = await request(app)
        .post(`/api/habits/${firstHabit.id}/log`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          date: today,
          completed: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.data.completed).toBe(true);
    });
  });

  describe('Daily Check-in Module', () => {
    it('should save a daily check-in', async () => {
      const res = await request(app)
        .post('/api/checkins')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          mood: 8,
          energy: 9,
          focus: 8,
          sleepHours: 7.5,
          exercise: true,
          nutrition: 8,
          screenTimeHours: 4.0,
          notes: 'Dia excelente com alto foco e energia',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.mood).toBe(8);
      expect(res.body.data.exercise).toBe(true);
    });

    it('should retrieve checkin history and averages', async () => {
      const res = await request(app)
        .get('/api/checkins/history?days=14')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.history.length).toBeGreaterThan(0);
      expect(res.body.data.averages.avgMood).toBeGreaterThan(0);
    });
  });

  describe('Journal Module', () => {
    it('should create and retrieve a journal entry', async () => {
      const res = await request(app)
        .post('/api/journal')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Reflexão sobre Foco e Gestão de Energia',
          content: 'A disciplina de manter limites claros no início do dia é transformadora para a clareza mental.',
          mood: 9,
          tags: 'disciplina, clareza, mentalidade',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Reflexão sobre Foco e Gestão de Energia');
    });
  });

  describe('Decisions Module', () => {
    it('should create and list strategic decisions', async () => {
      const res = await request(app)
        .post('/api/decisions')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Adotar Estratégia de Test-Driven Development para Módulos Críticos',
          context: 'Garantir estabilidade máxima e zero regressão no sistema.',
          decision: 'Escrever testes de integração antes de cada release.',
          reason: 'Acelera refatorações e aumenta a confiabilidade do produto.',
          expectedOutcome: 'Zero bugs críticos em produção.',
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBeDefined();
    });
  });

  describe('Action Plans Module', () => {
    it('should create a plan with steps and toggle a step', async () => {
      const res = await request(app)
        .post('/api/plans')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Plano de Implementação de Métricas de Performance',
          objective: 'Otimizar o tempo de resposta da API para < 50ms',
          reason: 'Melhorar a experiência de uso contínuo',
          expectedResult: 'Latência média reduzida em 60%',
          steps: [
            {
              stepNumber: 1,
              title: 'Análise de queries lentas com EXPLAIN ANALYZE',
              timeWindow: 'Segunda 14:00 - 15:30',
              howToExecute: 'Verificar índices no PostgreSQL para consultas de timeline e hábitos',
            },
            {
              stepNumber: 2,
              title: 'Adicionar índices compostos no Prisma',
              timeWindow: 'Terça 10:00 - 11:30',
              howToExecute: 'Executar prisma db push e rodar testes de benchmark',
            },
          ],
        });

      expect(res.status).toBe(201);
      expect(res.body.data.steps.length).toBe(2);

      const stepId = res.body.data.steps[0].id;
      const planId = res.body.data.id;

      const toggleRes = await request(app)
        .patch(`/api/plans/${planId}/steps/${stepId}/toggle`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(toggleRes.status).toBe(200);
      expect(toggleRes.body.data.steps[0].status).toBe('COMPLETED');
    });
  });

  describe('Atlas AI & Fallback Engine Module', () => {
    it('should execute chat with contextual intelligence', async () => {
      const res = await request(app)
        .post('/api/ai/chat')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          message: 'Como está minha situação atualmente? Faça um diagnóstico.',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.assistantMessage).toBeDefined();
      expect(res.body.data.assistantMessage.content).toContain('FATO');
    });

    it('should trigger quick-action diagnosis', async () => {
      const res = await request(app)
        .post('/api/ai/quick-action')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          actionType: 'diagnose',
        });

      expect(res.status).toBe(200);
      expect(res.body.data.assistantMessage.content).toBeDefined();
    });
  });

  describe('Weekly Report Module', () => {
    it('should generate a comprehensive weekly retrospective report', async () => {
      const res = await request(app)
        .get('/api/reports/weekly')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.synthesis).toBeDefined();
      expect(res.body.data.period).toBeDefined();
    });
  });
});
