import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware';

import { authRoutes } from './modules/auth/auth.routes';
import { profileRoutes } from './modules/profile/profile.routes';
import { areaRoutes } from './modules/areas/areas.routes';
import { goalRoutes } from './modules/goals/goals.routes';
import { projectRoutes } from './modules/projects/projects.routes';
import { taskRoutes } from './modules/tasks/tasks.routes';
import { habitRoutes } from './modules/habits/habits.routes';
import { checkinRoutes } from './modules/checkins/checkins.routes';
import { journalRoutes } from './modules/journal/journal.routes';
import { decisionRoutes } from './modules/decisions/decisions.routes';
import { planRoutes } from './modules/plans/plans.routes';
import { timelineRoutes } from './modules/timeline/timeline.routes';
import { reportRoutes } from './modules/reports/reports.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { aiRoutes } from './modules/ai/ai.routes';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow sandbox and dev environments
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(morgan('dev'));

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'Atlas Personal OS API',
  });
});

// Mount modular API routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/areas', areaRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/checkins', checkinRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/decisions', decisionRoutes);
app.use('/api/plans', planRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/ai', aiRoutes);

// Global Error Handler
app.use(errorHandler);

export default app;
