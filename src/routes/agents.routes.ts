import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { createAgent } from '../controllers/agents.controller';

const router = Router();
router.use(verifyToken);

router.post('/create', createAgent);

export default router;