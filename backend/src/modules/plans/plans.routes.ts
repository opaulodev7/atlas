import { Router } from 'express';
import { PlansController } from './plans.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createPlanSchema, updatePlanSchema } from './plans.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', PlansController.list);
router.get('/:id', PlansController.get);
router.post('/', validateRequest(createPlanSchema), PlansController.create);
router.put('/:id', validateRequest(updatePlanSchema), PlansController.update);
router.patch('/:id/steps/:stepId/toggle', PlansController.toggleStep);
router.delete('/:id', PlansController.delete);

export const planRoutes = router;
