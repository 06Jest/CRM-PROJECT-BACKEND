import { Router } from 'express';
import { verifyToken} from '../middleware/auth.middleware';
import {
  sendEmailHandler,
  sendInviteHandler,
  sendWeeklySummaryHandler,
  verifySmtpHandler,
  sendPasswordResetHandler,
} from '../controllers/email.controller';

const router = Router();
router.use(verifyToken);

router.post('/send', sendEmailHandler);
router.post('/invite', sendInviteHandler);
router.post('/weekly-summary', sendWeeklySummaryHandler);
router.get('/verify', verifySmtpHandler);
router.post('/reset-password', sendPasswordResetHandler);

export default router;