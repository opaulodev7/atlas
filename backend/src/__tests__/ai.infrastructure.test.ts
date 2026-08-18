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
  });

  describe('I. OpenAIProvider Continues Working', () => {
    it('should properly format and execute chat completion for OpenAI', async () => {
      const originalFetch = global.fetch;
      global.fetch = jest.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            choices: [
              {
                message: { content: 'Resposta OpenAI validada com sucesso.' },
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
        const res = await provider.chat([{ role: 'user', content: 'Teste OpenAI' }]);
        expect(res.provider).toBe('openai');
        expect(res.content).toContain('Resposta OpenAI');
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
      // Configure Gemini with a failing key to simulate API outage
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
        // Reset configuration to clean state
        config.ai.provider = 'gemini';
        config.ai.apiKey = '';
      }
    });
  });
});
