import { Router } from 'express';
import { CheckinsController } from './checkins.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { saveCheckinSchema } from './checkins.dto';

const router = Router();

router.use(authMiddleware);

router.get('/today', CheckinsController.getToday);
router.get('/history', CheckinsController.getHistory);
router.get('/date/:date', CheckinsController.getByDate);
router.post('/', validateRequest(saveCheckinSchema), CheckinsController.save);

export const checkinRoutes = router;
