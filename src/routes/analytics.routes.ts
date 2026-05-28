import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  getAllAnalytics,
  getSystemStatsHandler,
} from '../controllers/analytics.controller';

const router = Router();
router.use(verifyToken);

router.get('/', getAllAnalytics);

router.get('/system', getSystemStatsHandler);

export default router;