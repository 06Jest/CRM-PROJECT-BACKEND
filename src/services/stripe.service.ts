import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const getOrCreateCustomer =   async (
  memberId: string,
  email: string,
  name?: string
): Promise<string> => {
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', memberId)
    .single();
  
  if (existing?.stripe_customer_id) {
    return existing.stripe_customer_id;
  }

  const customer = await stripe.customers.create({
    email,
    name,
    metadata: { supabase_user_id: memberId },
  });

  return customer.id;
}

export const createCheckoutSession = async (
  priceId: string,
  memberId: string,
  email: string,
  name?: string
): Promise<string> => {
  const customerId = await getOrCreateCustomer(memberId, email, name);

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.FRONTEND_URL}/app/setting?success=true`,
    cancel_url: `${process.env.FRONTEND_URL}/pricing?canceled=true`,
    subscription_data: {
      trial_period_days: 14,
      metadata: { supabase_user_id: memberId },
    },
    metadata: { supabase_user_id: memberId },
  });
  return session.url!;
};

export const  createBillingPortalSession = async (
  memberId: string
): Promise<string> => {
  const { data } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', memberId)
    .single();

  if (!data?.stripe_customer_id) {
    throw new Error('No stripe customer found for this user');
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: data.stripe_customer_id,
    return_url: `${process.env.FRONTEND_URL}/app/settings`,
  });

  return session.url;
}

export const handleWebhookEvent = async (
  rawBody: Buffer,
  signature: string
): Promise<void> => {
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    throw new Error(`Webhook signature verification failed: ${err.message}`);
  }
  console.log(`[STRIPE] Webhook event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const memberId = session.metadata?.supabase_user_id;
      if(!memberId || !session.subscription) break;
      
      const subscription = await stripe.subscriptions.retrieve(
        session.subscription as string
      );

      await upsertSubscription(memberId, session.customer as string, subscription);
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object as Stripe.Subscription;
      const memberId = subscription.metadata?.supabase_user_id;;
      if (!memberId) break;
      await upsertSubscription(
        memberId,
        subscription.customer as string,
        subscription
      );
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      const memberId = subscription.metadata?.supabase_user_id;
      if (!memberId) break;

      await supabase
        .from('subscriptions')
        .update({
          plan: 'free',
          status: 'canceled',
          stripe_subscription_id: null,

          updated_at: new Date().toISOString(),
        })
        .eq('user_id', memberId);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;

      await supabase
        .from('subscriptions')
        .update({
          status: 'past_due',
          updated_at: new Date().toISOString(),
        })
        .eq('stripe_customer_id', customerId);
      break;
    }
  }
};

async function upsertSubscription(
  memberId: string,
  customerId: string,
  subscription: Stripe.Subscription
): Promise<void> {
  const priceId = subscription.items.data[0]?.price?.id;
  const plan = priceId === process.env.STRIPE_PRO_PRICE_ID ? 'pro' : 'free';

  await supabase
    .from('subscriptions')
    .upsert({
      user_id: memberId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      plan,
      status: subscription.status,
      current_period_end: new Date(
        subscription.current_period_end * 1000
      ).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id'});
}

export const getUserSubscription = async (memberId: string) => {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', memberId)
    .single();

  if (error && error.code !== 'PGRST116') throw new Error(error.message);
  return data;
}



export { stripe };

