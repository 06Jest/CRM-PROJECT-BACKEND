import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { sendSmsHandler } from '../controllers/sms.controller';

const router = Router();
router.use(requireAuth);
router.post('/send', sendSmsHandler);

export default router;
