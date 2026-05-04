import { Request, Response } from 'express';
import {
  createCheckoutSession,
  createBillingPortalSession,
  handleWebhookEvent,
  getUserSubscription,
} from '../services/stripe.service';

export const getPlans = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: [
      {
        id: 'free',
        name: 'Free',
        price: 0,
        priceId: process.env.STRIPE_FREE_PRICE_ID,
        features: [
          'Up to 100 contacts',
          'Up to 50 leads',
          'Basic dashboard',
          'Dark mode',
        ],
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 29,
        priceId: process.env.STRIPE_PRO_PRICE_ID,
        features: [
          'Unlimited contacts',
          'Unlimited leads',
          'AI assistant',
          'Reports & Analytics',
          'Real-time messaging',
          'CSV export',
          'Priority support',
        ],
      },
    ],
  });
};

export const createCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;;
    const { priceId } = req.body;
    if(!priceId) {
      res.status(400).json({
        success: false,
        error: 'priceId is required'
      });
      return;
    }
    const url = await createCheckoutSession(user.id, user.email, priceId, user.name);
    res.json({ success: true, data: { url }});
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const createPortal = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const url = await createBillingPortalSession(user.id);
    res.json({ success: true, data: { url }});
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getSubscription = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const user = (req as any).user;
    const subscription = await getUserSubscription(user.id);
    res.json({
      success: true,
      data: subscription || { plan: 'free', status: 'active'},
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });;
  }
}

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const signature = req.headers['stripe-signature'] as string;

  if (!signature) {
    res.status(400).json({ error: 'Missing stripe-signature header '});
    return;
  }
  try {
    await handleWebhookEvent(req.body as Buffer, signature);
    res.json({ received: true });
  } catch (err: any) {
    console.error('[STRIPE] Webhook error:', err.message);
    res.status(400).json({ error: err.message });
  }
};