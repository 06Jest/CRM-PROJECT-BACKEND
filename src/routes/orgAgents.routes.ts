import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getMemberName, getMemberProfile, updateAgentProfile } from '../controllers/agents.controller';
import { updateProfileSchema, uuidSchema } from '../schema/agent.schema';
import { validateParams, validateBody } from '../middleware/validate';



const router = Router();
router.use(verifyToken);


router.get('/members/:id/profile', validateParams(uuidSchema), getMemberProfile);
router.get('/members/:id/name', validateParams(uuidSchema),  getMemberName);
router.patch('/agents/:id/profile', validateParams(uuidSchema), validateBody(updateProfileSchema), updateAgentProfile);

export default router;