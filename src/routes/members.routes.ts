import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';
import { getAllMembersIDNames } from '../controllers/profile.controller';
import { readLimiter } from '../middleware/rate.limit.middleware';


const router = Router();
router.use(verifyToken);
router.use(authenticateUser);


router.get('/', readLimiter, getAllMembersIDNames);

export default router;