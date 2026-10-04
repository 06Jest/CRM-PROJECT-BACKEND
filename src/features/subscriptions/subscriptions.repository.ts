import { createSupabaseUserClient } from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import type {
  CreateSubscriptionDTO,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./subscriptions.types";

const tab = table.subscriptions;

// Create subscription
export const createSubscriptionInDB = async (
  orgId: string,
  dto: CreateSubscriptionDTO,
  accessToken: string
): Promise<Subscription> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert({
      org_id: orgId,
      plan: dto.plan,
      billing_cycle: dto.billing_cycle,
      payment_provider: dto.payment_provider,
      provider_reference:
        dto.provider_reference ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to create subscription: ${error.message}`
    );
  }

  return data;
};

// Get subscription by organization ID
export const getSubscriptionByOrgIdFromDB = async (
  organizationId: string,
  accessToken: string
): Promise<Subscription> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select("*")
    .eq("org_id", organizationId)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch subscription: ${error.message}`
    );
  }

  return data;
};

// Update subscription plan
export const updateSubscriptionPlanInDB = async (
  organizationId: string,
  plan: SubscriptionPlan,
  accessToken: string
): Promise<Subscription> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      plan,
    })
    .eq("org_id", organizationId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update subscription plan: ${error.message}`
    );
  }

  return data;
};

// Update subscription status
export const updateSubscriptionStatusInDB = async (
  organizationId: string,
  status: SubscriptionStatus,
  accessToken: string
): Promise<Subscription> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status,
    })
    .eq("org_id", organizationId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update subscription status: ${error.message}`
    );
  }

  return data;
};