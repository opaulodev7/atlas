# 🌐 ATLAS — Sistema Operacional Pessoal Inteligente (MVP Funcional)

> **Contexto → Diagnóstico → Prioridade → Ação → Acompanhamento → Aprendizado.**

O **Atlas** é um Sistema Operacional Pessoal projetado para transformar dados e acontecimentos da sua vida em tração prática, clareza mental e execução consistente. Construído com arquitetura de **Monólito Modular** em **TypeScript**, **Node.js**, **Express**, **Prisma ORM**, **PostgreSQL** e **React (Vite)**.

---

## ⚡ Visão Geral dos Módulos

- 🔐 **Autenticação & Segurança**: Cadastro, Login com JWT seguro, hash de senhas com `bcrypt` e proteção de rotas privadas.
- 🚀 **Onboarding Guiado**: 5 perguntas estruturadas que alimentam imediatamente o contexto cognitivo da IA.
- 📊 **Dashboard Executivo**: Saudação contextual, prioridade #1, resumo do dia, hábitos diários, tarefas pendentes e insights em tempo real.
- 🧭 **Áreas da Vida**: 8 áreas fundamentais (Carreira, Estudos, Finanças, Saúde, Projetos, Relacionamentos, Desenvolvimento Pessoal, Rotina) + Áreas customizáveis.
- 🎯 **Objetivos de Longo Prazo**: CRUD com prioridades, prazos, status e barras interativas de progresso.
- 📂 **Projetos**: Gerenciamento de iniciativas conectadas a objetivos e tarefas.
- ✓ **Tarefas**: Priorização (Urgente, Alta, Média, Baixa), prazos, filtros e conclusão rápida em 1 clique.
- 🔥 **Hábitos**: Frequência, metas, rastreamento diário, sequências (streaks) e taxa de aderência semanal (7 dias e 30 dias).
- ⚡ **Check-in Diário**: Registro rápido (< 2 min) de humor (0-10), energia (0-10), foco (0-10), sono (horas), exercício físico, nutrição e tempo de tela.
- 📖 **Diário Pessoal**: Registro livre de pensamentos e reflexões com preservação do texto original, tags e filtro por área.
- ⚖️ **Livro de Decisões**: Registro de contexto, decisão, motivo, alternativas e aprendizados com avaliação retrospectiva.
- 📋 **Planos de Ação**: Planos práticos com objetivo, motivo, resultado esperado, janelas de horário (*"Segunda 19h–19h30: ..."*), indicadores de sucesso, riscos e contingência.
- 🧠 **Atlas AI (Assistente Inteligente)**:
  - Injeção inteligente de contexto (perfil, objetivos, projetos, hábitos, check-ins e diário).
  - Ações rápidas: *Analisar Situação*, *Diagnosticar Gargalos*, *Criar Plano de Ação*, *Priorizar Hoje*, *Detectar Padrões*, *Revisar Semana*.
  - Conversão direta de respostas da IA em **Planos de Ação** salvos no banco.
  - **Motor de Fallback Inteligente Integrado**: funciona de maneira rica e contextualizada mesmo sem chaves de API externas.
- 📈 **Relatório Retrospectivo Semanal**: Síntese cognitiva com distinção rigorosa entre **[FATO]**, **[INTERPRETAÇÃO]**, **[HIPÓTESE]** e **[RECOMENDAÇÃO]**.
- ⏳ **Linha do Tempo**: Visualização cronológica unificada de todos os marcos, reflexões, decisões e conquistas.
- 👤 **Perfil Estratégico**: Profissão, bio, valores fundamentais, interesses e habilidades.

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia | Justificativa |
| :--- | :--- | :--- |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS | Interface ultra-rápida, tipada de ponta a ponta, moderna e responsiva. |
| **Backend** | Node.js + Express + TypeScript | Monólito modular robusto, performático, fácil de evoluir e debugar. |
| **ORM** | Prisma ORM | Modelagem de dados declarativa, migrações seguras e queries tipadas. |
| **Banco de Dados** | PostgreSQL 14+ / 17 | Banco relacional padrão da indústria com suporte a integridade referencial. |
| **Validação** | Zod | Schemas de validação estritos nos endpoints da API. |
| **Testes** | Jest + Supertest | Testes automatizados de integração cobrindo fluxos críticos. |

---

## 📋 Requisitos do Sistema

- **Node.js**: v18.0.0 ou superior (recomendado v20+)
- **npm**: v9.0.0 ou superior
- **PostgreSQL**: v14 ou superior rodando localmente ou via container/serviço gerenciado

---

## 🚀 Instalação e Execução Rápida

### 1. Clonar o repositório e instalar dependências

```bash
# Na raiz do projeto
npm run install:all
```

*(Ou instale manualmente em cada pasta: `cd backend && npm install` e `cd ../frontend && npm install`)*

---

### 2. Configurar o Banco de Dados PostgreSQL

No seu terminal do PostgreSQL (ou pgAdmin / psql):

```sql
CREATE USER atlas WITH PASSWORD 'atlas' SUPERUSER;
CREATE DATABASE atlas OWNER atlas;
```

---

### 3. Configurar as Variáveis de Ambiente

Copie o `.env.example` para `backend/.env`:

```bash
cp .env.example backend/.env
```

Conteúdo de `backend/.env`:

```env
# Banco de Dados (PostgreSQL)
DATABASE_URL="postgresql://atlas:atlas@localhost:5432/atlas"

# Configurações do Servidor
PORT=4000
NODE_ENV=development
JWT_SECRET="atlas_super_secret_jwt_key_2026_production_grade"
JWT_EXPIRES_IN="7d"

# Frontend URL (CORS)
FRONTEND_URL="http://localhost:5173"

# Configuração Opcional de Provedor de IA
# O Atlas possui um Motor Inteligente de Fallback embutido que funciona perfeitamente sem API Key.
# Para conectar ao OpenAI / Groq / Ollama / DeepSeek, basta preencher:
AI_PROVIDER="openai"
AI_API_KEY=""
AI_MODEL="gpt-4o-mini"
AI_BASE_URL="https://api.openai.com/v1"
```

---

### 4. Sincronizar o Banco de Dados e Rodar o Seed

```bash
# Sincronizar o Schema Prisma com o PostgreSQL
npm run db:push

# Popular o banco com dados demonstrativos fictícios
npm run db:seed
```

#### 🔑 Credenciais do Usuário de Demonstração (Seed):
- **E-mail**: `demo@atlas.io`
- **Senha**: `password123`

*(Você também pode clicar no botão **"Usar Conta Demo ⚡"** na tela de login ou criar uma conta nova pelo botão de cadastro)*

---

### 5. Iniciar a Aplicação

Em dois terminais (ou via scripts da raiz):

```bash
# Terminal 1 — Iniciar Backend (Porta 4000)
npm run dev:backend

# Terminal 2 — Iniciar Frontend (Porta 5173)
npm run dev:frontend
```

Abra no seu navegador: **`http://localhost:5173`**

---

## 🧪 Executando Testes Automatizados

O Atlas possui uma suíte completa de testes de integração automatizados que validam todos os módulos:

```bash
npm run test
```

Os testes cobrem:
- Autenticação (Registro, Login, Proteção de rotas com JWT)
- Obtenção do resumo do Dashboard
- CRUD e progresso de Objetivos
- CRUD e filtros de Tarefas
- Rastreamento diário de Hábitos e cálculo de sequências (streaks)
- Registro de Check-ins diários e cálculo de médias biométricas
- Entradas no Diário Pessoal
- Registro de Decisões Estratégicas
- Criação e execução de Planos de Ação
- Motor de Diagnóstico da IA e Ações Rápidas
- Geração do Relatório Retrospectivo Semanal

---

## 🏗️ Estrutura do Projeto

```
atlas/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma          # Modelagem de dados completa (PostgreSQL)
│   │   └── seed.ts                # Seed com dados demonstrativos consistentes
│   ├── src/
│   │   ├── __tests__/             # Suíte de testes automatizados (Jest/Supertest)
│   │   ├── config/                # Configurações de ambiente tipadas
│   │   ├── middleware/            # Auth JWT, Tratamento de Erros, Validação Zod
│   │   ├── modules/               # Monólito Modular
│   │   │   ├── auth/              # Autenticação e gestão de sessão
│   │   │   ├── profile/           # Perfil e onboarding do usuário
│   │   │   ├── areas/             # Áreas da vida
│   │   │   ├── goals/             # Objetivos estratégicos
│   │   │   ├── projects/          # Projetos
│   │   │   ├── tasks/             # Tarefas e micro-entregas
│   │   │   ├── habits/            # Hábitos e streaks
│   │   │   ├── checkins/          # Check-in diário e biometria
│   │   │   ├── journal/           # Diário pessoal e reflexões
│   │   │   ├── decisions/         # Livro de decisões
│   │   │   ├── plans/             # Planos de ação detalhados
│   │   │   ├── reports/           # Relatório semanal retrospectivo
│   │   │   ├── timeline/          # Linha do tempo cronológica
│   │   │   ├── dashboard/         # Agregação de dados do dashboard
│   │   │   └── ai/                # Camada modular de IA
│   │   │       ├── context.builder.ts   # Construtor de contexto relevante
│   │   │       ├── prompts/             # Prompts do sistema e personas
│   │   │       ├── providers/           # OpenAI, Groq, Ollama e Fallback Engine
│   │   │       └── ai.service.ts        # Serviço unificado de IA
│   │   ├── utils/                 # Helpers de data, respostas e logger de timeline
│   │   ├── app.ts                 # Configuração do Express e montagem de rotas
│   │   └── server.ts              # Ponto de entrada do servidor
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── layout/            # Sidebar, Navbar, AppLayout, ProtectedRoute
│   │   │   └── ui/                # Button, Card, Modal, Input, Textarea, Slider, Badge
│   │   ├── context/               # AuthContext para estado global de sessão
│   │   ├── pages/                 # Todas as páginas do sistema
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── OnboardingPage.tsx
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── ProfilePage.tsx
│   │   │   ├── AreasPage.tsx
│   │   │   ├── GoalsPage.tsx
│   │   │   ├── ProjectsPage.tsx
│   │   │   ├── TasksPage.tsx
│   │   │   ├── HabitsPage.tsx
│   │   │   ├── CheckinPage.tsx
│   │   │   ├── JournalPage.tsx
│   │   │   ├── PlansPage.tsx
│   │   │   ├── AIAssistantPage.tsx
│   │   │   ├── ReportsPage.tsx
│   │   │   ├── TimelinePage.tsx
│   │   │   ├── DecisionsPage.tsx
│   │   │   └── SettingsPage.tsx
│   │   ├── services/              # Chamadas à API tipadas com Axios
│   │   ├── types/                 # Definições TypeScript
│   │   ├── App.tsx                # Roteamento central
│   │   ├── main.tsx
│   │   └── index.css              # Tailwind CSS e tema escuro moderno
│   ├── package.json
│   └── vite.config.ts
│
├── .env.example
├── package.json                   # Script orquestrador da raiz
└── README.md
```

---

## 🔒 Privacidade e Responsabilidade da IA

1. **Privacidade**: As senhas são criptografadas com `bcryptjs`. Nenhuma chave de API ou credencial sensível é compartilhada com o cliente frontend.
2. **Responsabilidade**: O Atlas AI é um assistente de produtividade, organização estratégica e reflexão pessoal. Ele **não substitui aconselhamento médico ou psicológico** e evita diagnósticos clínicos.

---

## 📦 Build para Produção

Para gerar os pacotes de produção otimizados do backend e do frontend:

```bash
npm run build
```

- Backend compilado gerado em `backend/dist/`
- Frontend estático compilado gerado em `frontend/dist/`

---

## ✨ Primeiro Fluxo de Uso Recomendado

1. Acesse `http://localhost:5173/login` e entre com o usuário demo ou cadastre-se.
2. Complete o **Onboarding** respondendo às 5 perguntas sobre seu momento atual.
3. Navegue até o **Dashboard** para visualizar o estado consolidado.
4. Faça seu primeiro **Check-in Diário** avaliando humor, energia, foco e sono.
5. Registre o cumprimento de seus **Hábitos** e visualize a sequência.
6. Abra o **Atlas AI** e clique em *"⚙️ Diagnosticar Gargalos"* ou *"📋 Criar Plano de Ação"*.
7. Salve o plano gerado e acompanhe a conclusão das etapas no módulo de **Planos de Ação**.
8. Gere seu primeiro **Relatório Retrospectivo Semanal** e observe a distinção de Fato vs Interpretação.

**Atlas — Seu Sistema Operacional Pessoal está pronto para execução.**
