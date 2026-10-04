import { AppError } from "../../middleware/error.middleware";

import {
  LimitableResource,
  LimitType,
  PLAN_LIMITS,
  SubscriptionPlan,
} from "./subscriptions.types";

import { getSubscriptionService } from "./subscriptions.service";

import { getResourceCountFromDB } from "./subscriptions-limits.repository";

// Get plan limits
export const getPlanLimitsService = async (
  orgId: string,
  accessToken: string
): Promise<
  (typeof PLAN_LIMITS)[SubscriptionPlan]
> => {
  const subscription =
    await getSubscriptionService(
      orgId,
      accessToken
    );

  return PLAN_LIMITS[subscription.plan];
};

// Check resource limit
export const checkResourceLimitService = async (
  orgId: string,
  resource: LimitableResource,
  currentCount: number,
  limitType: LimitType,
  accessToken: string
): Promise<void> => {
  const limits =
    await getPlanLimitsService(
      orgId,
      accessToken
    );

  const limit =
    limits[resource][limitType];

  if (currentCount >= limit) {
    const label =
      limitType === "active_limit"
        ? "active"
        : "archived";

    throw new AppError(
      403,
      `Your workspace has reached the ${label} ${resource} limit for your current subscription.`
    );
  }
};

// Ensure resource limit
export const ensureResourceLimitService =
  async (
    orgId: string,
    tableName: string,
    resource: LimitableResource,
    limitType: LimitType,
    accessToken: string
  ): Promise<void> => {
    const currentCount =
      await getResourceCountFromDB(
        tableName,
        orgId,
        accessToken,
        limitType === "store_limit"
      );

    await checkResourceLimitService(
      orgId,
      resource,
      currentCount,
      limitType,
      accessToken
    );
  };