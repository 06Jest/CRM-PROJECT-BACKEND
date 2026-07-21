import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';
import { 
  addAgent,
  deleteAgent,
  demoteAdmin,
  getAllMembers,
  promoteAgent,
  updateAdminProfile,
  updateAgentStatus,
  updateAvatar,
} from '../controllers/admin.controller';
import { validateBody } from '../middleware/validate';
import { addProfileSchema, updateStatusSchema, updateAvatarSchema, updateProfileSchema, updateRoleSchema} from '../schema/orgAdmin.schema';



const router = Router();
router.use(verifyToken);
router.use(authenticateUser);

router.get('/members', getAllMembers);

router.post('/agents', validateBody(addProfileSchema), addAgent);

router.patch('/agents/:id/status', validateBody(updateStatusSchema), updateAgentStatus);
router.patch('/agents/:id/promote', validateBody(updateRoleSchema), promoteAgent);
router.patch('/admins/:id/demote', validateBody(updateRoleSchema), demoteAdmin);
router.patch('/admins/:id/profile',  validateBody(updateProfileSchema),  updateAdminProfile);
router.patch('/admins/:id/avatar', validateBody(updateAvatarSchema),  updateAvatar);

router.delete('/agents/:id', deleteAgent);

export default router;