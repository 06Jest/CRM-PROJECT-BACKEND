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
import { validateParams, validateBody } from '../middleware/validate';
import { addProfileSchema, statusSchema, updateAvatarSchema, updateProfileSchema, updateRoleSchema, uuidSchema } from '../schema/orgAdmin.schema';



const router = Router();
router.use(verifyToken);
router.use(authenticateUser);

router.get('/members', getAllMembers);

router.post('/agents', validateBody(addProfileSchema), addAgent);

router.patch('/agents/:id/status', validateBody(statusSchema), updateAgentStatus);
router.patch('/agents/:id/promote', validateBody(updateRoleSchema), promoteAgent);
router.patch('/admins/:id/demote', validateParams(uuidSchema), demoteAdmin);
router.patch('/admins/:id/profile', validateParams(uuidSchema), validateBody(updateProfileSchema),  updateAdminProfile);
router.patch('/admins/:id/avatar', validateParams(uuidSchema), validateBody(updateAvatarSchema),  updateAvatar);

router.delete('/agents/:id',validateParams(uuidSchema), deleteAgent);

export default router;