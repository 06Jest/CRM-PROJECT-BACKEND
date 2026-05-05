import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import { createAgent } from '../controllers/agents.controller';

const router = Router();
router.use(requireAuth);

router.post('/create', createAgent);

export default router;