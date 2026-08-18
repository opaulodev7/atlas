import { Router } from 'express';
import { ProjectsController } from './projects.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createProjectSchema, updateProjectSchema } from './projects.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', ProjectsController.list);
router.get('/:id', ProjectsController.get);
router.post('/', validateRequest(createProjectSchema), ProjectsController.create);
router.put('/:id', validateRequest(updateProjectSchema), ProjectsController.update);
router.delete('/:id', ProjectsController.delete);

export const projectRoutes = router;
