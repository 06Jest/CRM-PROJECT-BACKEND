import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { getAllMembersIDNames } from '../controllers/profile.controller';



const router = Router();
router.use(verifyToken);

router.get('/members', getAllMembersIDNames);


export default router;