import { Router } from 'express';
import { HabitsController } from './habits.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createHabitSchema, updateHabitSchema, logHabitSchema } from './habits.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', HabitsController.list);
router.get('/:id', HabitsController.get);
router.post('/', validateRequest(createHabitSchema), HabitsController.create);
router.put('/:id', validateRequest(updateHabitSchema), HabitsController.update);
router.post('/:id/log', validateRequest(logHabitSchema), HabitsController.log);
router.delete('/:id', HabitsController.delete);

export const habitRoutes = router;
