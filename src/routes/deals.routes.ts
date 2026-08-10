import { Router } from 'express';
import { authenticateUser, requireActiveMembership, verifyToken } from '../middleware/auth.middleware';
import { getDeals, addDeal, updateDeal, deleteDeal, updateDealStage, getDealsLists} from './../controllers/deals.controller'
import { validateBody } from '../middleware/validate';
import { addDealSchema, updateDealSchema, updateDealStageSchema } from '../schema/deal.schema';
import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';

const router = Router();
router.use(verifyToken);
router.use(authenticateUser);



router.get('/show-deals',readLimiter, getDeals);
router.get('/show-deals-lists',readLimiter, getDealsLists);

router.use(requireActiveMembership);

router.post('/add-deal',createLimiter, validateBody(addDealSchema), addDeal);

router.patch('/update-deal/:id', updateLimiter, validateBody(updateDealSchema), updateDeal);
router.patch('/update-deal-stage/:id', updateLimiter, validateBody(updateDealStageSchema), updateDealStage);

router.delete('/delete-deal/:id',deleteLimiter, deleteDeal);

export default router;

 