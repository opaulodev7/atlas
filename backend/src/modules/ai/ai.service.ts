import { config } from '../../config';
import { prisma } from '../../prisma/client';
import { ContextBuilder } from './context.builder';
import { IAIProvider, ChatMessage, AIProviderResponse } from './providers/ai.provider.interface';
import { OpenAIProvider } from './providers/openai.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { FallbackAIProvider } from './providers/fallback.provider';

export class AIService {
  /**
   * Resolves the primary AI provider based on configuration.
   * Returns:
   * - OpenAIProvider when AI_PROVIDER is 'openai' and AI_API_KEY is non-empty.
   * - GeminiProvider when AI_PROVIDER is 'gemini' and AI_API_KEY is non-empty.
   * - FallbackAIProvider for any other value, empty API key, or missing configuration.
   */
  public static getPrimaryProvider(): IAIProvider {
    const provider = (config.ai.provider || '').toLowerCase().trim();
    const hasApiKey = Boolean(config.ai.apiKey && config.ai.apiKey.trim().length > 0);

    if (provider === 'openai' && hasApiKey) {
      return new OpenAIProvider(
        config.ai.apiKey,
        config.ai.model,
        config.ai.baseUrl,
        config.ai.timeoutMs
      );
    }

    if (provider === 'gemini' && hasApiKey) {
      return new GeminiProvider(
        config.ai.apiKey,
        config.ai.model,
        config.ai.baseUrl,
        config.ai.timeoutMs
      );
    }

    return new FallbackAIProvider();
  }

  /**
   * Executes AI chat with automatic, zero-downtime fallback to the heuristic engine
   * in case of timeout, auth failure, rate limit, quota exhaustion or network issues.
   */
  static async chat(userId: string, message: string, conversationId?: string) {
    const primaryProvider = this.getPrimaryProvider();

    // 1. Find or create conversation
    let conv = conversationId
      ? await prisma.aIConversation.findFirst({
          where: { id: conversationId, userId },
          include: { messages: { orderBy: { createdAt: 'asc' } } },
        })
      : null;

    if (!conv) {
      conv = await prisma.aIConversation.create({
        data: {
          userId,
          title: message.substring(0, 40).trim() || 'Conversa com Atlas AI',
        },
        include: { messages: true },
      });
    }

    // 2. Build user context safely
    const userContext = await ContextBuilder.buildUserContext(userId);
    const contextString = ContextBuilder.formatContextForPrompt(userContext);

    // 3. Save user message in conversation
    const userMsg = await prisma.aIMessage.create({
      data: {
        conversationId: conv.id,
        role: 'user',
        content: message,
      },
    });

    // 4. Prepare message history (last 10 messages for token efficiency)
    const history: ChatMessage[] = (conv.messages || [])
      .concat(userMsg)
      .slice(-10)
      .map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

    // 5. Attempt call to primary provider, seamlessly falling back if any error occurs
    let aiResponse: AIProviderResponse;
    let usedFallback = false;
    let fallbackReason: string | undefined;

    try {
      aiResponse = await primaryProvider.chat(history, contextString);
    } catch (err: any) {
      usedFallback = true;
      fallbackReason = err.message || 'Falha não especificada na chamada principal';

      // Sanitized warning log (never exposes API key, JWT or raw data)
      console.warn(`[AIService] Provedor principal falhou (${fallbackReason}). Acionando FallbackAIProvider...`);

      const fallback = new FallbackAIProvider();
      aiResponse = await fallback.chat(history, contextString);
    }

    // 6. Save assistant message and audit metadata
    const assistantMsg = await prisma.aIMessage.create({
      data: {
        conversationId: conv.id,
        role: 'assistant',
        content: aiResponse.content,
        contextUsed: JSON.stringify({
          provider: aiResponse.provider,
          model: aiResponse.model,
          fallbackUsed: usedFallback,
          fallbackReason: fallbackReason || null,
          goalsActive: userContext.goals.length,
          habitsActive: userContext.habits.length,
        }),
      },
    });

    // 7. Update conversation updatedAt timestamp
    await prisma.aIConversation.update({
      where: { id: conv.id },
      data: { updatedAt: new Date() },
    });

    return {
      conversationId: conv.id,
      userMessage: userMsg,
      assistantMessage: assistantMsg,
      provider: aiResponse.provider,
      suggestedPlan: aiResponse.suggestedPlan,
      suggestedTasks: aiResponse.suggestedTasks,
      suggestedHabits: aiResponse.suggestedHabits,
    };
  }

  static async listConversations(userId: string) {
    return prisma.aIConversation.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  static async getConversation(userId: string, id: string) {
    const conv = await prisma.aIConversation.findFirst({
      where: { id, userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conv) {
      throw new Error('Conversa não encontrada');
    }

    return conv;
  }

  static async deleteConversation(userId: string, id: string) {
    const conv = await prisma.aIConversation.findFirst({
      where: { id, userId },
    });

    if (!conv) {
      throw new Error('Conversa não encontrada');
    }

    return prisma.aIConversation.delete({
      where: { id },
    });
  }

  static async quickAction(
    userId: string,
    actionType: 'analyze' | 'diagnose' | 'plan' | 'review' | 'prioritize' | 'patterns' | 'reflect'
  ) {
    const promptMap: Record<string, string> = {
      analyze: 'Como está minha situação atualmente? Faça uma análise completa com base no meu contexto.',
      diagnose: 'Quais são meus principais gargalos e pontos de atrito no momento?',
      plan: 'Crie um plano prático e estruturado para acelerar meus objetivos principais com janelas de horários e etapas claras.',
      review: 'Como foi meu desempenho e evolução na última semana? Faça uma revisão analítica.',
      prioritize: 'O que devo fazer hoje com base nas minhas metas e tarefas prioritárias?',
      patterns: 'Você percebe algum padrão ou correlação relevante nos meus check-ins, hábitos e registros?',
      reflect: 'O que mudou em mim e na minha rotina nos últimos 30 dias?',
    };

    const promptText = promptMap[actionType] || promptMap.analyze;
    return this.chat(userId, promptText);
  }
}
