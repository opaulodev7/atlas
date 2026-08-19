import { z } from 'zod';
import { IAIProvider, ChatMessage, AIProviderResponse, SuggestedPlan, SuggestedTask, SuggestedHabit } from './ai.provider.interface';
import { ATLAS_SYSTEM_PROMPT } from '../prompts/system.prompt';

// Zod Schema to validate raw OpenAI API response safely
const openAIChatCompletionSchema = z.object({
  choices: z.array(
    z.object({
      message: z.object({
        content: z.string().nullable().optional(),
      }),
      finish_reason: z.string().nullable().optional(),
    })
  ).min(1, 'Resposta da OpenAI não contém opções (choices) válidas'),
});

// Zod Schemas for structured actions (Plans, Tasks, Habits)
const planStepSchema = z.object({
  stepNumber: z.number().int().positive(),
  title: z.string().min(1),
  description: z.string().optional(),
  timeWindow: z.string().optional(),
  howToExecute: z.string().optional(),
});

const suggestedPlanSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  reason: z.string().min(1),
  expectedResult: z.string().min(1),
  indicators: z.string().optional().default(''),
  risks: z.string().optional().default(''),
  contingencyPlan: z.string().optional().default(''),
  steps: z.array(planStepSchema).min(1),
});

const suggestedTaskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(''),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
  deadline: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  areaName: z.string().optional().default(''),
});

const suggestedHabitSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional().default(''),
  frequency: z.enum(['DAILY', 'WEEKDAYS', 'WEEKENDS', 'WEEKLY']).optional().default('DAILY'),
  target: z.string().optional().default('1x ao dia'),
  areaName: z.string().optional().default(''),
});

export class OpenAIProvider implements IAIProvider {
  private apiKey: string;
  private model: string;
  private baseUrl: string;
  private timeoutMs: number;

  constructor(
    apiKey: string,
    model = 'gpt-4o-mini',
    baseUrl = 'https://api.openai.com/v1',
    timeoutMs = 15000
  ) {
    this.apiKey = apiKey.trim();
    this.model = model.trim() || 'gpt-4o-mini';
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.timeoutMs = timeoutMs > 0 ? timeoutMs : 15000;
  }

  async chat(messages: ChatMessage[], contextString?: string): Promise<AIProviderResponse> {
    if (!this.apiKey) {
      throw new Error('[OpenAI Provider] Chave de API (AI_API_KEY) não configurada.');
    }

    const formattedMessages: ChatMessage[] = [
      {
        role: 'system',
        content: `${ATLAS_SYSTEM_PROMPT}\n\n${contextString || ''}`,
      },
      ...messages,
    ];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: formattedMessages,
          temperature: 0.7,
        }),
        signal: controller.signal,
      });
    } catch (err: any) {
      if (err.name === 'AbortError' || controller.signal.aborted) {
        throw new Error(
          `[OpenAI Timeout] A requisição excedeu o tempo limite configurado de ${this.timeoutMs / 1000}s.`
        );
      }
      throw new Error(
        `[OpenAI Network Error] Falha na comunicação de rede com o endpoint (${err.message || 'Erro de conexão'}).`
      );
    } finally {
      clearTimeout(timeoutId);
    }

    // Handle HTTP status codes appropriately
    if (!response.ok) {
      const status = response.status;
      let safeErrorDetail = '';
      try {
        const errorJson = (await response.json()) as any;
        safeErrorDetail = errorJson?.error?.message || '';
      } catch {
        safeErrorDetail = await response.text().catch(() => '');
      }

      if (status === 401) {
        throw new Error(
          `[OpenAI Auth Error (401)] Chave de API inválida, revogada ou não autorizada. Detalhes: ${safeErrorDetail}`
        );
      }
      if (status === 429) {
        throw new Error(
          `[OpenAI Rate Limit / Quota Error (429)] Limite de requisições ou cota de tokens excedida. Detalhes: ${safeErrorDetail}`
        );
      }
      if (status >= 500 && status < 600) {
        throw new Error(
          `[OpenAI Server Error (${status})] Instabilidade temporária nos servidores da OpenAI. Tente novamente mais tarde.`
        );
      }

      throw new Error(
        `[OpenAI API Error (${status})] Requisição rejeitada pela API. Detalhes: ${safeErrorDetail}`
      );
    }

    // Safely parse JSON response without blind trust
    let rawJson: unknown;
    try {
      rawJson = await response.json();
    } catch {
      throw new Error('[OpenAI Response Error] A resposta retornada pela API não é um JSON válido.');
    }

    const parseResult = openAIChatCompletionSchema.safeParse(rawJson);
    if (!parseResult.success) {
      throw new Error(
        `[OpenAI Response Schema Error] Estrutura de resposta inesperada: ${parseResult.error.message}`
      );
    }

    const rawContent = parseResult.data.choices[0]?.message?.content || 'Sem resposta gerada pelo modelo.';

    // Extract structured actions (Plan, Tasks, Habits) and sanitize content
    const { cleanContent, suggestedPlan, suggestedTasks, suggestedHabits } =
      this.extractAndSanitizeStructuredActions(rawContent);

    return {
      content: cleanContent,
      provider: 'openai',
      model: this.model,
      suggestedPlan,
      suggestedTasks,
      suggestedHabits,
    };
  }

  /**
   * Safely extracts structured actions (Plans, Tasks, Habits) using exclusive tags,
   * validates via Zod, and strips the raw action blocks from the user-facing content.
   */
  private extractAndSanitizeStructuredActions(text: string): {
    cleanContent: string;
    suggestedPlan?: SuggestedPlan;
    suggestedTasks?: SuggestedTask[];
    suggestedHabits?: SuggestedHabit[];
  } {
    let suggestedPlan: SuggestedPlan | undefined = undefined;
    let suggestedTasks: SuggestedTask[] | undefined = undefined;
    let suggestedHabits: SuggestedHabit[] | undefined = undefined;
    let cleanContent = text;

    // 1. Extract suggested plan (atlas-plan)
    try {
      const planMatch = text.match(/```atlas-plan\s*([\s\S]*?)\s*```/);
      if (planMatch) {
        const parsed = JSON.parse(planMatch[1].trim());
        const validated = suggestedPlanSchema.safeParse(parsed);
        if (validated.success) {
          suggestedPlan = validated.data as SuggestedPlan;
          cleanContent = cleanContent.replace(/```atlas-plan\s*[\s\S]*?\s*```/g, '');
        }
      }
    } catch {
      // safe fallback
    }

    // 2. Extract suggested tasks (atlas-tasks)
    try {
      const tasksMatch = text.match(/```atlas-tasks\s*([\s\S]*?)\s*```/);
      if (tasksMatch) {
        const parsed = JSON.parse(tasksMatch[1].trim());
        const validated = z.array(suggestedTaskSchema).safeParse(parsed);
        if (validated.success && validated.data.length > 0) {
          suggestedTasks = validated.data as SuggestedTask[];
          cleanContent = cleanContent.replace(/```atlas-tasks\s*[\s\S]*?\s*```/g, '');
        }
      }
    } catch {
      // safe fallback
    }

    // 3. Extract suggested habits (atlas-habits)
    try {
      const habitsMatch = text.match(/```atlas-habits\s*([\s\S]*?)\s*```/);
      if (habitsMatch) {
        const parsed = JSON.parse(habitsMatch[1].trim());
        const validated = z.array(suggestedHabitSchema).safeParse(parsed);
        if (validated.success && validated.data.length > 0) {
          suggestedHabits = validated.data as SuggestedHabit[];
          cleanContent = cleanContent.replace(/```atlas-habits\s*[\s\S]*?\s*```/g, '');
        }
      }
    } catch {
      // safe fallback
    }

    return {
      cleanContent: cleanContent.trim(),
      suggestedPlan,
      suggestedTasks,
      suggestedHabits,
    };
  }
}
