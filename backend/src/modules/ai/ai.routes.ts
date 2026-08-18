import { Router } from 'express';
import { AIController } from './ai.controller';
import { authMiddleware } from '../../middleware/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.post('/chat', AIController.chat);
router.post('/quick-action', AIController.quickAction);
router.get('/conversations', AIController.listConversations);
router.get('/conversations/:id', AIController.getConversation);
router.delete('/conversations/:id', AIController.deleteConversation);

export const aiRoutes = router;
