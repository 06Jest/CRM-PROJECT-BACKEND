import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  sendSmsHandler,
  getSmsStatusHandler,
  getSmsHistoryHandler,
} from '../controllers/sms.controller';

const router = Router();
router.use(verifyToken);

router.post('/send', sendSmsHandler);
router.get('/status/:sid', getSmsStatusHandler);
router.get('/history/:contactName', getSmsHistoryHandler);;

export default router;
