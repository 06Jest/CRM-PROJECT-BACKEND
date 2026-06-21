import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import * as dealController  from '../controllers/deals.controller';

const router = Router();

router.use(authenticateUser);


router.get('/show-deals', dealController.getDeals);
router.post('/add-deal', dealController.addDeal);
router.patch('/update-deal', dealController.updateDeal);
router.patch('/close-deal', dealController.closeDeal);
router.delete('/delete-deal', dealController.deleteDeal);

export default router;

 