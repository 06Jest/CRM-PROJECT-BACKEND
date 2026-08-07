import { z } from "zod";

import { billingCycleSchema, paymentProviderSchema, providerReferenceSchema, subscriptionPlanSchema, subscriptionStatusSchema } from "./global.schema";

export const createSubscriptionSchema = z.object({

  plan: subscriptionPlanSchema.nullable().optional(),

  billing_cycle: billingCycleSchema.nullable().optional(),

  payment_provider: paymentProviderSchema.nullable().optional(),

  provider_reference: providerReferenceSchema.nullable().optional(),
  
});

export const updateSubscriptionPlanSchema = z.object({

  plan: subscriptionPlanSchema,

});


export const updateSubscriptionStatusSchema = z.object({

  status: subscriptionStatusSchema,

});