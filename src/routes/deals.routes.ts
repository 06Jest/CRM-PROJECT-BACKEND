import { Router } from 'express';
import { authenticateUser, requireActiveMembership, verifyToken } from '../middleware/auth.middleware';
import { getDeals, addDeal, updateDeal, deleteDeal, updateDealStage, getDealsLists, getDealListByID, getDealsListsByContactID} from './../controllers/deals.controller'
import { validateBody } from '../middleware/validate';
import { addDealSchema, updateDealSchema, updateDealStageSchema } from '../schema/deal.schema';
import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';

const router = Router();
router.use(verifyToken);
router.use(authenticateUser);



router.get(
  '/show-deals',
  readLimiter, 
  getDeals
);

router.get(
  '/show-lists',
  readLimiter, 
  getDealsLists
);

router.get(
  '/show-by-id',
  readLimiter, 
  getDealsListsByContactID
);

router.get(
  '/view-list/:id',
  readLimiter, 
  getDealListByID
);

router.use(requireActiveMembership);

router.post(
  '/add',
  createLimiter, 
  validateBody(addDealSchema), 
  addDeal
);

router.patch(
  '/update/:id', 
  updateLimiter, 
  validateBody(updateDealSchema), 
  updateDeal
);

router.patch(
  '/update/stage/:id', 
  updateLimiter, 
  validateBody(updateDealStageSchema), 
  updateDealStage
);

router.delete(
  '/delete/:id',
  deleteLimiter, 
  deleteDeal
);

export default router;

 