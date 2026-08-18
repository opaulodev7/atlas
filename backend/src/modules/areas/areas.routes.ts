import { Router } from 'express';
import { AreasController } from './areas.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createAreaSchema, updateAreaSchema } from './areas.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', AreasController.list);
router.get('/:id', AreasController.get);
router.post('/', validateRequest(createAreaSchema), AreasController.create);
router.put('/:id', validateRequest(updateAreaSchema), AreasController.update);
router.delete('/:id', AreasController.delete);

export const areaRoutes = router;
