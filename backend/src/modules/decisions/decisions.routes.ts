import { Router } from 'express';
import { DecisionsController } from './decisions.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createDecisionSchema, updateDecisionSchema } from './decisions.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', DecisionsController.list);
router.get('/:id', DecisionsController.get);
router.post('/', validateRequest(createDecisionSchema), DecisionsController.create);
router.put('/:id', validateRequest(updateDecisionSchema), DecisionsController.update);
router.delete('/:id', DecisionsController.delete);

export const decisionRoutes = router;
