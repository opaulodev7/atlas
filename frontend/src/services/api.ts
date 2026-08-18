import axios from 'axios';
import {
  User,
  DashboardSummary,
  LifeArea,
  Goal,
  Project,
  Task,
  Habit,
  DailyCheckIn,
  JournalEntry,
  Decision,
  Plan,
  TimelineEvent,
  AIConversation,
} from '../types';

export const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercept requests to add Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('atlas_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercept responses to handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('atlas_token');
      localStorage.removeItem('atlas_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data.data;
  },
  register: async (name: string, email: string, password: string) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data.data;
  },
  me: async () => {
    const res = await api.get('/auth/me');
    return res.data.data as User;
  },
};

// Profile Service
export const profileService = {
  getProfile: async () => {
    const res = await api.get('/profile');
    return res.data.data as User;
  },
  updateProfile: async (data: any) => {
    const res = await api.put('/profile', data);
    return res.data.data as User;
  },
  completeOnboarding: async (data: any) => {
    const res = await api.post('/profile/onboarding', data);
    return res.data.data as User;
  },
};

// Dashboard Service
export const dashboardService = {
  getSummary: async () => {
    const res = await api.get('/dashboard/summary');
    return res.data.data as DashboardSummary;
  },
};

// Life Areas Service
export const areasService = {
  list: async () => {
    const res = await api.get('/areas');
    return res.data.data as LifeArea[];
  },
  get: async (id: string) => {
    const res = await api.get(`/areas/${id}`);
    return res.data.data as LifeArea;
  },
  create: async (data: Partial<LifeArea>) => {
    const res = await api.post('/areas', data);
    return res.data.data as LifeArea;
  },
  update: async (id: string, data: Partial<LifeArea>) => {
    const res = await api.put(`/areas/${id}`, data);
    return res.data.data as LifeArea;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/areas/${id}`);
    return res.data.data;
  },
};

// Goals Service
export const goalsService = {
  list: async (filters?: { status?: string; areaId?: string }) => {
    const res = await api.get('/goals', { params: filters });
    return res.data.data as Goal[];
  },
  get: async (id: string) => {
    const res = await api.get(`/goals/${id}`);
    return res.data.data as Goal;
  },
  create: async (data: any) => {
    const res = await api.post('/goals', data);
    return res.data.data as Goal;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/goals/${id}`, data);
    return res.data.data as Goal;
  },
  updateProgress: async (id: string, progress: number, status?: string) => {
    const res = await api.patch(`/goals/${id}/progress`, { progress, status });
    return res.data.data as Goal;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/goals/${id}`);
    return res.data.data;
  },
};

// Projects Service
export const projectsService = {
  list: async (filters?: { status?: string; goalId?: string; areaId?: string }) => {
    const res = await api.get('/projects', { params: filters });
    return res.data.data as Project[];
  },
  get: async (id: string) => {
    const res = await api.get(`/projects/${id}`);
    return res.data.data as Project;
  },
  create: async (data: any) => {
    const res = await api.post('/projects', data);
    return res.data.data as Project;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/projects/${id}`, data);
    return res.data.data as Project;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/projects/${id}`);
    return res.data.data;
  },
};

// Tasks Service
export const tasksService = {
  list: async (filters?: { status?: string; priority?: string; goalId?: string; projectId?: string; areaId?: string; today?: boolean }) => {
    const res = await api.get('/tasks', { params: filters });
    return res.data.data as Task[];
  },
  create: async (data: any) => {
    const res = await api.post('/tasks', data);
    return res.data.data as Task;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/tasks/${id}`, data);
    return res.data.data as Task;
  },
  toggle: async (id: string) => {
    const res = await api.patch(`/tasks/${id}/toggle`);
    return res.data.data as Task;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/tasks/${id}`);
    return res.data.data;
  },
};

// Habits Service
export const habitsService = {
  list: async () => {
    const res = await api.get('/habits');
    return res.data.data as Habit[];
  },
  get: async (id: string) => {
    const res = await api.get(`/habits/${id}`);
    return res.data.data as Habit;
  },
  create: async (data: any) => {
    const res = await api.post('/habits', data);
    return res.data.data as Habit;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/habits/${id}`, data);
    return res.data.data as Habit;
  },
  toggleLog: async (id: string, date: string, completed?: boolean, notes?: string) => {
    const res = await api.post(`/habits/${id}/log`, { date, completed, notes });
    return res.data.data;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/habits/${id}`);
    return res.data.data;
  },
};

// Check-ins Service
export const checkinsService = {
  getToday: async () => {
    const res = await api.get('/checkins/today');
    return res.data.data as DailyCheckIn | null;
  },
  getByDate: async (date: string) => {
    const res = await api.get(`/checkins/date/${date}`);
    return res.data.data as DailyCheckIn | null;
  },
  save: async (data: Partial<DailyCheckIn>) => {
    const res = await api.post('/checkins', data);
    return res.data.data as DailyCheckIn;
  },
  getHistory: async (days = 30) => {
    const res = await api.get('/checkins/history', { params: { days } });
    return res.data.data as { history: DailyCheckIn[]; averages: any };
  },
};

// Journal Service
export const journalService = {
  list: async (filters?: { search?: string; areaId?: string }) => {
    const res = await api.get('/journal', { params: filters });
    return res.data.data as JournalEntry[];
  },
  get: async (id: string) => {
    const res = await api.get(`/journal/${id}`);
    return res.data.data as JournalEntry;
  },
  create: async (data: Partial<JournalEntry>) => {
    const res = await api.post('/journal', data);
    return res.data.data as JournalEntry;
  },
  update: async (id: string, data: Partial<JournalEntry>) => {
    const res = await api.put(`/journal/${id}`, data);
    return res.data.data as JournalEntry;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/journal/${id}`);
    return res.data.data;
  },
};

// Decisions Service
export const decisionsService = {
  list: async () => {
    const res = await api.get('/decisions');
    return res.data.data as Decision[];
  },
  get: async (id: string) => {
    const res = await api.get(`/decisions/${id}`);
    return res.data.data as Decision;
  },
  create: async (data: Partial<Decision>) => {
    const res = await api.post('/decisions', data);
    return res.data.data as Decision;
  },
  update: async (id: string, data: Partial<Decision>) => {
    const res = await api.put(`/decisions/${id}`, data);
    return res.data.data as Decision;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/decisions/${id}`);
    return res.data.data;
  },
};

// Action Plans Service
export const plansService = {
  list: async (filters?: { status?: string; goalId?: string }) => {
    const res = await api.get('/plans', { params: filters });
    return res.data.data as Plan[];
  },
  get: async (id: string) => {
    const res = await api.get(`/plans/${id}`);
    return res.data.data as Plan;
  },
  create: async (data: any) => {
    const res = await api.post('/plans', data);
    return res.data.data as Plan;
  },
  update: async (id: string, data: any) => {
    const res = await api.put(`/plans/${id}`, data);
    return res.data.data as Plan;
  },
  toggleStep: async (planId: string, stepId: string) => {
    const res = await api.patch(`/plans/${planId}/steps/${stepId}/toggle`);
    return res.data.data as Plan;
  },
  delete: async (id: string) => {
    const res = await api.delete(`/plans/${id}`);
    return res.data.data;
  },
};

// Timeline Service
export const timelineService = {
  list: async (filters?: { type?: string; limit?: number; offset?: number }) => {
    const res = await api.get('/timeline', { params: filters });
    return res.data.data as { events: TimelineEvent[]; total: number };
  },
};

// Weekly Reports Service
export const reportsService = {
  getWeeklyReport: async () => {
    const res = await api.get('/reports/weekly');
    return res.data.data;
  },
};

// Atlas AI Service
export const aiService = {
  chat: async (message: string, conversationId?: string) => {
    const res = await api.post('/ai/chat', { message, conversationId });
    return res.data.data;
  },
  quickAction: async (actionType: 'analyze' | 'diagnose' | 'plan' | 'review' | 'prioritize' | 'patterns' | 'reflect') => {
    const res = await api.post('/ai/quick-action', { actionType });
    return res.data.data;
  },
  listConversations: async () => {
    const res = await api.get('/ai/conversations');
    return res.data.data as AIConversation[];
  },
  getConversation: async (id: string) => {
    const res = await api.get(`/ai/conversations/${id}`);
    return res.data.data as AIConversation;
  },
  deleteConversation: async (id: string) => {
    const res = await api.delete(`/ai/conversations/${id}`);
    return res.data.data;
  },
};
