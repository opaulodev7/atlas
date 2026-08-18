import { Router } from 'express';
import { TasksController } from './tasks.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createTaskSchema, updateTaskSchema } from './tasks.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', TasksController.list);
router.get('/:id', TasksController.get);
router.post('/', validateRequest(createTaskSchema), TasksController.create);
router.put('/:id', validateRequest(updateTaskSchema), TasksController.update);
router.patch('/:id/toggle', TasksController.toggle);
router.delete('/:id', TasksController.delete);

export const taskRoutes = router;
