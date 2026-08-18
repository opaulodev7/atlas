import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/summary', DashboardController.getSummary);

export const dashboardRoutes = router;
