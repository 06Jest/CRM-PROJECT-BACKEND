import { Router } from 'express';
import { verifyToken, superAdminOnly } from '../middleware/auth.middleware';
import * as adminController from '../controllers/adminController';

const router = Router();

router.use(verifyToken);
router.use(superAdminOnly);


router.get('/dashboard-stats', adminController.dashboardStats);

router.post('/ban-user', adminController.banUserController);
router.post('/unban-user', adminController.unbanUserController);
router.post('/delete-user', adminController.deleteUserController);

router.post('/pause-organization', adminController.pauseOrgController);
router.post('/resume-organization', adminController.resumeOrgController);
router.post('/delete-organization', adminController.deleteOrgController);

export default router;