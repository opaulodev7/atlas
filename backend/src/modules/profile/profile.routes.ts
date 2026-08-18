import { Router } from 'express';
import { ProfileController } from './profile.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { updateProfileSchema, onboardingSchema } from './profile.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', ProfileController.getProfile);
router.put('/', validateRequest(updateProfileSchema), ProfileController.updateProfile);
router.post('/onboarding', validateRequest(onboardingSchema), ProfileController.completeOnboarding);

export const profileRoutes = router;
