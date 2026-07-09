import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getMemberName, getMemberProfile, updateAgentProfile } from '../controllers/agents.controller';
import { updateProfileSchema } from '../schema/agent.schema';
import {  validateBody } from '../middleware/validate';


const router = Router();
router.use(verifyToken);


router.get('/members/:id/profile', getMemberProfile);
router.get('/members/:id/name',  getMemberName);
router.patch('/agents/profile', validateBody(updateProfileSchema), updateAgentProfile);

export default router;