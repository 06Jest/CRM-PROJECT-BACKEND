import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';
import { getDeals, addDeal, updateDeal, deleteDeal, updateDealStage, getDealsLists} from './../controllers/deals.controller'
import { validateBody } from '../middleware/validate';
import { addDealSchema, updateDealSchema, updateDealStageSchema } from '../schema/deal.schema';

const router = Router();
router.use(verifyToken);
router.use(authenticateUser);


router.get('/show-deals', getDeals);
router.get('/show-deals-lists', getDealsLists);
router.post('/add-deal', validateBody(addDealSchema), addDeal);
router.patch('/update-deal/:id', validateBody(updateDealSchema), updateDeal);
router.patch('/update-deal-stage/:id', validateBody(updateDealStageSchema), updateDealStage);
router.delete('/delete-deal/:id', deleteDeal);

export default router;

 