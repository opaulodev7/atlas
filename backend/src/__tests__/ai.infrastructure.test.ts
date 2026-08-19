import { OpenAIProvider } from '../modules/ai/providers/openai.provider';
import { GeminiProvider } from '../modules/ai/providers/gemini.provider';
import { FallbackAIProvider } from '../modules/ai/providers/fallback.provider';
import { AIService } from '../modules/ai/ai.service';
import { prisma } from '../prisma/client';
import { config } from '../config';

describe('AI Infrastructure Multi-Provider & Resilience Tests (OpenAI + Gemini + Fallback)', () => {
  let testUserId = '';

  beforeAll(async () => {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@atlas.io' },
    });
    testUserId = user?.id || '';
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('A & B. Provider Selection in AIService.getPrimaryProvider()', () => {
    it('should select GeminiProvider when AI_PROVIDER is gemini and API key is present', () => {
      config.ai.provider = 'gemini';
      config.ai.apiKey = 'test-gemini-key';
      config.ai.model = 'gemini-1.5-flash';

      const provider = AIService.getPrimaryProvider();
      expect(provider).toBeInstanceOf(GeminiProvider);
    });

    it('should select OpenAIProvider when AI_PROVIDER is openai and API key is present', () => {
      config.ai.provider = 'openai';
      config.ai.apiKey = 'sk-test-openai-key';
      config.ai.model = 'gpt-4o-mini';

      const provider = AIService.getPrimaryProvider();
      expect(provider).toBeInstanceOf(OpenAIProvider);
    });

    it('C. should use FallbackAIProvider when AI_PROVIDER is gemini but API key is empty', () => {
      config.ai.provider = 'gemini';
      config.ai.apiKey = '';

      const provider = AIService.getPrimaryProvider();
      expect(provider).toBeInstanceOf(FallbackAIProvider);
    });

    it('should use FallbackAIProvider when AI_PROVIDER is unknown or fallback', () => {
      config.ai.provider = 'fallback';
      config.ai.apiKey = 'some-key';

      const provider = AIService.getPrimaryProvider();
      expect(provider).toBeInstanceOf(FallbackAIProvider);
    });
  });

  describe('GeminiProvider Unit Tests & Error Classifications', () => {
    it('should throw immediately if Gemini API key is missing', async () => {
      const provider = new GeminiProvider('', 'gemini-1.5-flash');
      await expect(
        provider.chat([{ role: 'user', content: 'Olá' }])
      ).rejects.toThrow('Chave de API (AI_API_KEY) não configurada');
    });

    it('G. should enforce timeout using AbortController on Gemini request', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockImplementation((url, options) => {
        return new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            resolve(
              new Response(
                JSON.stringify({
                  candidates: [{ content: { parts: [{ text: 'ok' }] } }],
                })
              )
            );
          }, 200);

          if (options?.signal) {
            options.signal.addEventListener('abort', () => {
              clearTimeout(timeout);
              const err = new Error('The operation was aborted');
              err.name = 'AbortError';
              reject(err);
            });
          }
        });
      }) as any;

      try {
        const provider = new GeminiProvider('gemini-key', 'gemini-1.5-flash', 'https://generativelanguage.googleapis.com/v1beta', 50);
        await expect(
          provider.chat([{ role: 'user', content: 'Teste de timeout' }])
        ).rejects.toThrow(/\[Gemini Timeout\]/);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('D. should classify Gemini 400/401/403 Auth/Permission errors', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: 'API key not valid. Please pass a valid API key.', status: 'INVALID_ARGUMENT' } }),
          {
            status: 400,
            statusText: 'Bad Request',
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('invalid-key', 'gemini-1.5-flash');
        await expect(
          provider.chat([{ role: 'user', content: 'Teste auth' }])
        ).rejects.toThrow(/\[Gemini Auth Error \(400\)\]/);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('E. should classify Gemini 429 Rate Limit / Quota Exhausted errors', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({ error: { message: 'Resource has been exhausted (e.g. check quota).', status: 'RESOURCE_EXHAUSTED' } }),
          {
            status: 429,
            statusText: 'Too Many Requests',
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('gemini-key', 'gemini-1.5-flash');
        await expect(
          provider.chat([{ role: 'user', content: 'Teste quota' }])
        ).rejects.toThrow(/\[Gemini Rate Limit \/ Quota Error \(429\)\]/);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('F. should classify Gemini 5xx Server errors', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response('Internal Server Error', {
          status: 503,
          statusText: 'Service Unavailable',
        })
      ) as any;

      try {
        const provider = new GeminiProvider('gemini-key', 'gemini-1.5-flash');
        await expect(
          provider.chat([{ role: 'user', content: 'Teste 503' }])
        ).rejects.toThrow(/\[Gemini Server Error \(503\)\]/);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('H. should safely handle malformed/invalid Gemini responses without crashing', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(JSON.stringify({ unexpectedStructure: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        })
      ) as any;

      try {
        const provider = new GeminiProvider('gemini-key', 'gemini-1.5-flash');
        await expect(
          provider.chat([{ role: 'user', content: 'Teste payload inválido' }])
        ).rejects.toThrow(/\[Gemini Response Schema Error\]/);
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should successfully parse valid Gemini response with content', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: '### 🧭 Diagnóstico Estratégico gerado pelo Gemini' }],
                  role: 'model',
                },
                finishReason: 'STOP',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('valid-key', 'gemini-1.5-flash');
        const res = await provider.chat([{ role: 'user', content: 'Olá Gemini' }]);
        expect(res.provider).toBe('gemini');
        expect(res.content).toContain('Diagnóstico Estratégico');
      } finally {
        global.fetch = originalFetch;
      }
    });

    it('should extract structured atlas-plan block and clean content for Gemini', async () => {
      const rawTextWithAtlasPlan = `Aqui está seu plano de ação para os próximos dias:

### 📋 Cronograma de Execução
1. Estudo inicial na segunda-feira.

\`\`\`atlas-plan
{
  "title": "Plano de Estudo TypeScript",
  "objective": "Aprender TypeScript em 7 dias",
  "reason": "Capacitação técnica para o Atlas",
  "expectedResult": "Domínio de interfaces e types",
  "indicators": "Testes passando",
  "risks": "Falta de tempo",
  "contingencyPlan": "Estudar no sábado",
  "steps": [
    {
      "stepNumber": 1,
      "title": "Fundamentos",
      "timeWindow": "Dia 1: 09h00–10h00",
      "howToExecute": "Ler documentação oficial"
    }
  ]
}
\`\`\``;

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: rawTextWithAtlasPlan }],
                  role: 'model',
                },
                finishReason: 'STOP',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('valid-key', 'gemini-1.5-flash');
        const res = await provider.chat([{ role: 'user', content: 'Crie um plano' }]);
        
        expect(res.provider).toBe('gemini');
        expect(res.suggestedPlan).toBeDefined();
        expect(res.suggestedPlan?.title).toBe('Plano de Estudo TypeScript');
        expect(res.suggestedPlan?.steps.length).toBe(1);
        expect(res.suggestedPlan?.steps[0].timeWindow).toBe('Dia 1: 09h00–10h00');
        expect(res.content).not.toContain('```atlas-plan');
        expect(res.content).toContain('Aqui está seu plano de ação');
      } finally {
        global.fetch = originalFetch;
      }
    });

    // Phase 5C Test 1: Only Tasks extraction
    it('should extract structured atlas-tasks block and clean content for Gemini', async () => {
      const rawTextWithTasks = `Aqui estão 2 tarefas prioritárias para hoje:

1. Configurar tsconfig
2. Criar testes

\`\`\`atlas-tasks
[
  {
    "title": "Configurar tipos estritos no tsconfig",
    "description": "Ativar strict e noImplicitAny",
    "priority": "HIGH",
    "deadline": "2026-08-19",
    "areaName": "Carreira"
  },
  {
    "title": "Escrever testes de unidade para Gemini",
    "priority": "URGENT",
    "areaName": "Estudos"
  }
]
\`\`\``;

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: rawTextWithTasks }],
                  role: 'model',
                },
                finishReason: 'STOP',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('valid-key', 'gemini-1.5-flash');
        const res = await provider.chat([{ role: 'user', content: 'Crie tarefas para mim' }]);

        expect(res.provider).toBe('gemini');
        expect(res.suggestedTasks).toBeDefined();
        expect(res.suggestedTasks?.length).toBe(2);
        expect(res.suggestedTasks?.[0].title).toBe('Configurar tipos estritos no tsconfig');
        expect(res.suggestedTasks?.[0].priority).toBe('HIGH');
        expect(res.suggestedTasks?.[0].deadline).toBe('2026-08-19');
        expect(res.suggestedTasks?.[1].title).toBe('Escrever testes de unidade para Gemini');
        expect(res.suggestedTasks?.[1].priority).toBe('URGENT');
        expect(res.content).not.toContain('```atlas-tasks');
        expect(res.content).toContain('Aqui estão 2 tarefas prioritárias');
      } finally {
        global.fetch = originalFetch;
      }
    });

    // Phase 5C Test 2: Only Habits extraction
    it('should extract structured atlas-habits block and clean content for Gemini', async () => {
      const rawTextWithHabits = `Recomendo este hábito para manter sua consistência:

\`\`\`atlas-habits
[
  {
    "name": "Leitura Técnica Diária",
    "description": "Ler 30 minutos logo após o café",
    "frequency": "DAILY",
    "target": "30 min",
    "areaName": "Estudos"
  }
]
\`\`\``;

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: rawTextWithHabits }],
                  role: 'model',
                },
                finishReason: 'STOP',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('valid-key', 'gemini-1.5-flash');
        const res = await provider.chat([{ role: 'user', content: 'Sugira um hábito' }]);

        expect(res.provider).toBe('gemini');
        expect(res.suggestedHabits).toBeDefined();
        expect(res.suggestedHabits?.length).toBe(1);
        expect(res.suggestedHabits?.[0].name).toBe('Leitura Técnica Diária');
        expect(res.suggestedHabits?.[0].target).toBe('30 min');
        expect(res.suggestedHabits?.[0].frequency).toBe('DAILY');
        expect(res.content).not.toContain('```atlas-habits');
      } finally {
        global.fetch = originalFetch;
      }
    });

    // Phase 5C Test 3: Tasks + Habits in the same response
    it('should extract both atlas-tasks and atlas-habits from the same response', async () => {
      const rawTextWithBoth = `Aqui está o resumo da sua rotina proposta:

\`\`\`atlas-tasks
[
  {
    "title": "Revisar PRs do time",
    "priority": "HIGH",
    "areaName": "Carreira"
  }
]
\`\`\`

\`\`\`atlas-habits
[
  {
    "name": "Meditação Matinal",
    "frequency": "DAILY",
    "target": "10 min",
    "areaName": "Saúde"
  }
]
\`\`\``;

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: rawTextWithBoth }],
                  role: 'model',
                },
                finishReason: 'STOP',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('valid-key', 'gemini-1.5-flash');
        const res = await provider.chat([{ role: 'user', content: 'Organize minha rotina' }]);

        expect(res.provider).toBe('gemini');
        expect(res.suggestedTasks?.length).toBe(1);
        expect(res.suggestedTasks?.[0].title).toBe('Revisar PRs do time');
        expect(res.suggestedHabits?.length).toBe(1);
        expect(res.suggestedHabits?.[0].name).toBe('Meditação Matinal');
        expect(res.content).not.toContain('```atlas-tasks');
        expect(res.content).not.toContain('```atlas-habits');
        expect(res.content).toContain('Aqui está o resumo');
      } finally {
        global.fetch = originalFetch;
      }
    });

    // Phase 5C Test 4: Normal conversational response without actionable entities
    it('should return undefined for suggestedPlan, suggestedTasks, suggestedHabits on plain conversation', async () => {
      const plainText = `### Reflexão do Dia
Hoje sua energia foi consistente e o sono foi reparador. Continue mantendo esse ritmo.`;

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: plainText }],
                  role: 'model',
                },
                finishReason: 'STOP',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('valid-key', 'gemini-1.5-flash');
        const res = await provider.chat([{ role: 'user', content: 'Como estou hoje?' }]);

        expect(res.provider).toBe('gemini');
        expect(res.suggestedPlan).toBeUndefined();
        expect(res.suggestedTasks).toBeUndefined();
        expect(res.suggestedHabits).toBeUndefined();
        expect(res.content).toBe(plainText);
      } finally {
        global.fetch = originalFetch;
      }
    });

    // Phase 5C Test 5: Invalid JSON handling in atlas-tasks/atlas-habits
    it('should safely handle invalid JSON inside atlas-tasks or atlas-habits without breaking chat', async () => {
      const rawTextWithCorruptedTags = `Aqui está a resposta:

\`\`\`atlas-tasks
[ { "title": "Quebrado", incomplete...
\`\`\`

\`\`\`atlas-habits
[ { "name": 12345 } ]
\`\`\``;

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: rawTextWithCorruptedTags }],
                  role: 'model',
                },
                finishReason: 'STOP',
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new GeminiProvider('valid-key', 'gemini-1.5-flash');
        const res = await provider.chat([{ role: 'user', content: 'Teste corrupção' }]);

        expect(res.provider).toBe('gemini');
        expect(res.suggestedTasks).toBeUndefined();
        expect(res.suggestedHabits).toBeUndefined();
        expect(res.content).toContain('Aqui está a resposta');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('I. OpenAIProvider Continues Working & Extracts Actionable Blocks', () => {
    it('should properly format, execute chat completion and extract atlas-tasks for OpenAI', async () => {
      const rawTextWithTasks = `Aqui estão suas tarefas:

\`\`\`atlas-tasks
[
  {
    "title": "Escrever documentação",
    "priority": "MEDIUM",
    "areaName": "Carreira"
  }
]
\`\`\``;

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: { content: rawTextWithTasks },
              },
            ],
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }
        )
      ) as any;

      try {
        const provider = new OpenAIProvider('sk-test-key', 'gpt-4o-mini');
        const res = await provider.chat([{ role: 'user', content: 'Crie tarefas' }]);
        expect(res.provider).toBe('openai');
        expect(res.suggestedTasks?.length).toBe(1);
        expect(res.suggestedTasks?.[0].title).toBe('Escrever documentação');
        expect(res.content).not.toContain('```atlas-tasks');
      } finally {
        global.fetch = originalFetch;
      }
    });
  });

  describe('J. FallbackAIProvider Continues Working & End-to-End Fallback', () => {
    it('should produce diagnostic output on fallback provider', async () => {
      const fallback = new FallbackAIProvider();
      const res = await fallback.chat([{ role: 'user', content: 'Como está minha situação atualmente?' }]);
      expect(res.provider).toBe('atlas-intelligent-fallback');
      expect(res.content).toContain('FATO');
      expect(res.content).toContain('RECOMENDAÇÃO');
    });

    it('should execute end-to-end AIService fallback gracefully when configured provider fails', async () => {
      config.ai.provider = 'gemini';
      config.ai.apiKey = 'failing-key';

      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockRejectedValue(new Error('Connection refused by remote host'));

      try {
        const result = await AIService.chat(testUserId, 'Quais são meus gargalos atuais?');
        expect(result.assistantMessage).toBeDefined();
        expect(result.assistantMessage.content).toContain('Gargalo');
        expect(result.provider).toBe('atlas-intelligent-fallback');
      } finally {
        global.fetch = originalFetch;
        config.ai.provider = 'gemini';
        config.ai.apiKey = '';
      }
    });
  });
});
