import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware';
import {
  createCheckout, stripeWebhook, getPlans,
} from '../controllers/stripe.controller';

const router = Router();

router.post('/webhook', stripeWebhook);

router.use(requireAuth);
router.get('/plans', getPlans);
router.post('/checkout', createCheckout);

export default router;