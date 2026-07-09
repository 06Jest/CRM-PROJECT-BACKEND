import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { getDeals, addDeal, updateDeal, closeDeal, deleteDeal} from './../controllers/deals.controller'
import { validateBody } from '../middleware/validate';
import { addDealSchema, updateDealSchema } from '../schema/deal.schema';
const router = Router();

router.use(authenticateUser);


router.get('/show-deals', getDeals);
router.post('/add-deal', validateBody(addDealSchema), addDeal);
router.patch('/update-deal/:id', validateBody(updateDealSchema), updateDeal);
router.patch('/close-deal/:id', closeDeal);
router.delete('/delete-deal/:id', deleteDeal);

export default router;

 