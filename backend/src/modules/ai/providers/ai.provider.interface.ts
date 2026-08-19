export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface SuggestedPlanStep {
  stepNumber: number;
  title: string;
  description?: string;
  timeWindow?: string;
  howToExecute?: string;
}

export interface SuggestedPlan {
  title: string;
  objective: string;
  reason: string;
  expectedResult: string;
  indicators?: string;
  risks?: string;
  contingencyPlan?: string;
  steps: SuggestedPlanStep[];
}

export interface SuggestedTask {
  title: string;
  description?: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  deadline?: string; // Formato YYYY-MM-DD
  areaName?: string;
}

export interface SuggestedHabit {
  name: string;
  description?: string;
  frequency?: 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'WEEKLY';
  target?: string;
  areaName?: string;
}

export interface AIProviderResponse {
  content: string;
  provider: string;
  model: string;
  suggestedPlan?: SuggestedPlan;
  suggestedTasks?: SuggestedTask[];
  suggestedHabits?: SuggestedHabit[];
}

export interface IAIProvider {
  chat(messages: ChatMessage[], contextString?: string): Promise<AIProviderResponse>;
}
