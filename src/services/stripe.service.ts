import Stripe from 'stripe';;

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-04-22.dahlia',
});

export const createCheckoutSession = async (
  priceId: string,
  customerId?: string
): Promise<string> => {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/app/setting?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing`,
    customer: customerId,
  });
  return session.url!;
};

export { stripe };

