import { Router } from 'express';
import { ReportsController } from './reports.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/weekly', ReportsController.getWeeklyReport);

export const reportRoutes = router;
