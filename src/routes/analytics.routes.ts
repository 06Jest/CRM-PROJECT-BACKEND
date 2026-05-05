import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  getAllAnalytics,
  getSystemStatsHandler,
} from '../controllers/analytics.controller';

const router = Router();
router.use(requireAuth);

router.get('/', getAllAnalytics);

router.get('/system', getSystemStatsHandler);

export default router;