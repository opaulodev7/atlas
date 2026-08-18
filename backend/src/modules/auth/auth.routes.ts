import { Router } from 'express';
import { AuthController } from './auth.controller';
import { validateRequest } from '../../middleware/validation.middleware';
import { registerSchema, loginSchema } from './auth.dto';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.post('/register', validateRequest(registerSchema), AuthController.register);
router.post('/login', validateRequest(loginSchema), AuthController.login);
router.get('/me', authMiddleware, AuthController.me);

export const authRoutes = router;
