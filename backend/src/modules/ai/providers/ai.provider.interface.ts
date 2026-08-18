export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AIProviderResponse {
  content: string;
  provider: string;
  model: string;
  suggestedPlan?: {
    title: string;
    objective: string;
    reason: string;
    expectedResult: string;
    indicators: string;
    risks: string;
    contingencyPlan: string;
    steps: Array<{
      stepNumber: number;
      title: string;
      description?: string;
      timeWindow?: string;
      howToExecute?: string;
    }>;
  };
}

export interface IAIProvider {
  chat(messages: ChatMessage[], contextString?: string): Promise<AIProviderResponse>;
}
