import type {
  CreateSubscriptionDTO,
  Subscription,
  SubscriptionPlan,
  SubscriptionStatus,
} from "./subscriptions.types";

import {
  createSubscriptionInDB,
  getSubscriptionByOrgIdFromDB,
  updateSubscriptionPlanInDB,
  updateSubscriptionStatusInDB,
} from "./subscriptions.repository";

import {
  updateOnboardingStepService,
  completeOnboardingService,
} from "../profiles/profiles.service";

// Create subscription
export const createSubscriptionService = async (
  orgId: string,
  dto: CreateSubscriptionDTO,
  accessToken: string
): Promise<Subscription> => {
  return createSubscriptionInDB(
    orgId,
    dto,
    accessToken
  );
};

// Get subscription
export const getSubscriptionService = async (
  orgId: string,
  accessToken: string
): Promise<Subscription> => {
  return getSubscriptionByOrgIdFromDB(
    orgId,
    accessToken
  );
};

// Update subscription plan
export const updateSubscriptionPlanService = async (
  organizationId: string,
  plan: SubscriptionPlan,
  accessToken: string
): Promise<Subscription> => {
  return updateSubscriptionPlanInDB(
    organizationId,
    plan,
    accessToken
  );
};

// Update subscription status
export const updateSubscriptionStatusService = async (
  organizationId: string,
  status: SubscriptionStatus,
  accessToken: string
): Promise<Subscription> => {
  return updateSubscriptionStatusInDB(
    organizationId,
    status,
    accessToken
  );
};

// Complete subscription onboarding
export const completeSubscriptionOnboardingService =
  async (
    userId: string,
    accessToken: string
  ): Promise<void> => {
    await updateOnboardingStepService(
      userId,
      3,
      accessToken
    );

    await completeOnboardingService(
      userId,
      accessToken
    );
  };