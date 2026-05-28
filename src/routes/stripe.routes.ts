import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import {
  getPlans,
  createCheckout,
  createPortal,
  getSubscription,
  stripeWebhook,
} from '../controllers/stripe.controller';

const router = Router();

router.post('/webhook', stripeWebhook);

router.use(verifyToken);
router.get('/plans', getPlans);
router.get('/subscription', getSubscription);
router.post('/checkout', createCheckout);
router.post('/portal', createPortal);

export default router;