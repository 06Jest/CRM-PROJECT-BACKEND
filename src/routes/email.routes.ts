import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  sendEmailHandler,
  sendInviteHandler,
  sendWeeklySummaryHandler,
  verifySmtpHandler,
} from '../controllers/email.controller';

const router = Router();
router.use(requireAuth);

router.post('/send', sendEmailHandler);
router.post('/invite', sendInviteHandler);
router.post('/weekly-summary', sendWeeklySummaryHandler);
router.get('/verify', verifySmtpHandler)

export default router;