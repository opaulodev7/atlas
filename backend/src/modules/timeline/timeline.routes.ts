import { Router } from 'express';
import { TimelineController } from './timeline.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', TimelineController.list);

export const timelineRoutes = router;
