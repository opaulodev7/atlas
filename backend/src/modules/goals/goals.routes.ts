import { Router } from 'express';
import { GoalsController } from './goals.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createGoalSchema, updateGoalSchema, updateGoalProgressSchema } from './goals.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', GoalsController.list);
router.get('/:id', GoalsController.get);
router.post('/', validateRequest(createGoalSchema), GoalsController.create);
router.put('/:id', validateRequest(updateGoalSchema), GoalsController.update);
router.patch('/:id/progress', validateRequest(updateGoalProgressSchema), GoalsController.updateProgress);
router.delete('/:id', GoalsController.delete);

export const goalRoutes = router;
