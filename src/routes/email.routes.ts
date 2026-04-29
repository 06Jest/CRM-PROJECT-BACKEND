import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { sendEmailHandler } from '../controllers/email.controller';

const router = Router();
router.use(requireAuth);
router.post('/send', sendEmailHandler);

export default router;