import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  sendSmsHandler,
  getSmsStatusHandler,
  getSmsHistoryHandler,
} from '../controllers/sms.controller';

const router = Router();
router.use(requireAuth);

router.post('/send', sendSmsHandler);
router.get('/status/:sid', getSmsStatusHandler);
router.get('/history/:contactName', getSmsHistoryHandler);;

export default router;
