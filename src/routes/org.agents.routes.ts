import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {  getMemberProfile, updateAgentProfile } from '../controllers/agents.controller';
import { updateProfileSchema } from '../schema/agent.schema';
import {  validateBody } from '../middleware/validate';
import { getAllMembersIDNamesFromDB } from '../services/profiles.service';


const router = Router();
router.use(verifyToken);


router.get('/members/:id/profile', getMemberProfile);
// router.get('/members/:id/name',  getMemberName);
router.get('/members/:orgId', getAllMembersIDNamesFromDB);
router.patch('/agents/profile', validateBody(updateProfileSchema), updateAgentProfile);

export default router;