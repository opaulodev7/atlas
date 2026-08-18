export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  onboardingCompleted?: boolean;
  profile?: Profile;
}

export interface Profile {
  id: string;
  userId: string;
  profession?: string;
  bio?: string;
  personalGoals?: string;
  values?: string;
  interests?: string;
  skills?: string;
  onboardingCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LifeArea {
  id: string;
  userId: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
  _count?: {
    goals: number;
    projects: number;
    tasks: number;
    habits: number;
  };
}

export interface Goal {
  id: string;
  userId: string;
  areaId?: string;
  area?: LifeArea;
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED' | 'CANCELLED';
  progress: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  projects?: Project[];
  tasks?: Task[];
  plans?: Plan[];
}

export interface Project {
  id: string;
  userId: string;
  goalId?: string;
  goal?: Goal;
  areaId?: string;
  area?: LifeArea;
  title: string;
  description?: string;
  status: 'PLANNING' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
  progress: number;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

export interface Task {
  id: string;
  userId: string;
  goalId?: string;
  goal?: { id: string; title: string };
  projectId?: string;
  project?: { id: string; title: string };
  areaId?: string;
  area?: { id: string; name: string; color: string };
  title: string;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
  deadline?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;
  completed: boolean;
  notes?: string;
}

export interface Habit {
  id: string;
  userId: string;
  areaId?: string;
  area?: LifeArea;
  name: string;
  description?: string;
  frequency: 'DAILY' | 'WEEKDAYS' | 'WEEKENDS' | 'WEEKLY';
  target: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  todayCompleted?: boolean;
  completedToday?: boolean;
  currentStreak?: number;
  rate7Days?: number;
  rate30Days?: number;
  weekHistory?: Array<{ date: string; completed: boolean }>;
}

export interface DailyCheckIn {
  id: string;
  userId: string;
  date: string;
  mood: number;
  energy: number;
  focus: number;
  sleepHours: number;
  exercise: boolean;
  nutrition: number;
  screenTimeHours: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  areaId?: string;
  area?: LifeArea;
  title?: string;
  content: string;
  date: string;
  mood?: number;
  tags?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Decision {
  id: string;
  userId: string;
  title: string;
  context: string;
  decision: string;
  reason: string;
  alternatives?: string;
  expectedOutcome?: string;
  actualOutcome?: string;
  learnings?: string;
  date: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanStep {
  id: string;
  planId: string;
  stepNumber: number;
  title: string;
  description?: string;
  timeWindow?: string;
  howToExecute?: string;
  status: 'PENDING' | 'COMPLETED';
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  userId: string;
  goalId?: string;
  goal?: Goal;
  title: string;
  objective: string;
  reason: string;
  expectedResult: string;
  deadline?: string;
  indicators?: string;
  risks?: string;
  contingencyPlan?: string;
  status: 'DRAFT' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  steps: PlanStep[];
  createdAt: string;
  updatedAt: string;
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

export interface TimelineEvent {
  id: string;
  userId: string;
  type: string;
  title: string;
  description?: string;
  entityId?: string;
  date: string;
  metadata?: string;
  createdAt: string;
}

export interface DashboardSummary {
  user: {
    id: string;
    name: string;
    profession?: string;
    onboardingCompleted?: boolean;
  };
  greeting: string;
  date: string;
  todayCheckin?: DailyCheckIn | null;
  habits: {
    total: number;
    completedToday: number;
    items: Habit[];
  };
  topPriorityGoal?: Goal | null;
  activeGoals: {
    total: number;
    items: Goal[];
  };
  activeProjects: {
    total: number;
    items: Project[];
  };
  pendingTasks: {
    total: number;
    items: Task[];
  };
  weeklyProgress: {
    completedTasksCount: number;
    habitAdherenceRate: number;
    daysLoggedCount: number;
  };
  insight: {
    title: string;
    type: string;
    content: string;
  };
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  suggestedPlan?: SuggestedPlan | null;
  contextUsed?: string | null;
}

export interface AIConversation {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: AIMessage[];
}
