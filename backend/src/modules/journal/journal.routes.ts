import { Router } from 'express';
import { JournalController } from './journal.controller';
import { authMiddleware } from '../../middleware/auth.middleware';
import { validateRequest } from '../../middleware/validation.middleware';
import { createJournalSchema, updateJournalSchema } from './journal.dto';

const router = Router();

router.use(authMiddleware);

router.get('/', JournalController.list);
router.get('/:id', JournalController.get);
router.post('/', validateRequest(createJournalSchema), JournalController.create);
router.put('/:id', validateRequest(updateJournalSchema), JournalController.update);
router.delete('/:id', JournalController.delete);

export const journalRoutes = router;
