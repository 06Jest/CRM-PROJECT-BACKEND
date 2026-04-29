import { Request, Response } from 'express';;
import { createCheckoutSession, stripe } from '../services/stripe.service';

export const createCheckout = async (req: Request, res: Response): Promise<void> => {
  try {
    const { priceId, customerId } = req.body;
    if(!priceId) {
      res.status(400).json({
        success: false,
        error: 'priceId is required'
      });
      return;
    }
    const url = await createCheckoutSession(priceId, customerId);
    res.json({ success: true, data: { url }});
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};

export const stripeWebhook = async (req: Request, res: Response): Promise<void> => {
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
    switch (event.type) {
      case 'checkout.session.completed':
        console.log('Payment completed:', event.data.object);
        break;
      case 'customer.subscription.deleted':
        console.log('Subscription cancelled:', event.data.object);
        break;;
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getPlans =  async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: [
      { id: 'free', name: 'Free, price: 0' },
      { id: 'pro_monthly', name: 'Pro', price: 29},
    ],
  });
};