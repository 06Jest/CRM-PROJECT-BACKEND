import { AppError } from "../middleware/error.middleware";
import { LimitableResource, LimitType, PLAN_LIMITS, SubscriptionPlan } from "../types/subscription";
import { getSubscriptionByOrgIdFromDB } from "./subscriptions.service";
import { createSupabaseUserClient } from "../config/supabase";


export const getResourceCountFromDB = async (
  tableName: string,
  orgId: string,
  accessToken: string,
  archived = false
): Promise<number> => {

  const db = createSupabaseUserClient(accessToken);

  let query = db
    .from(tableName)
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("org_id", orgId);

  query = archived
    ? query.not("deleted_at", "is", null)
    : query.is("deleted_at", null);

  const { count, error } = await query;

  if (error) {
    throw new AppError(
      500,
      `Failed to count resources in ${tableName}: ${error.message}`
    );
  }

  return count ?? 0;
};


export const getPlanLimits = async (
  orgId: string,
  accessToken: string
): Promise<(typeof PLAN_LIMITS)[SubscriptionPlan]> => {
  const subscription = await getSubscriptionByOrgIdFromDB(
    orgId,
    accessToken
  );

  return PLAN_LIMITS[subscription.plan];
};


export const checkResourceLimit = async (
  orgId: string,
  resource: LimitableResource,
  currentCount: number,
  limitType: LimitType,
  accessToken: string
): Promise<void> => {

  const limits = await getPlanLimits(
    orgId,
    accessToken
  );

  const limit = limits[resource][limitType];

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




export const ensureResourceLimit = async (
  orgId: string,
  tableName: string,
  resource: LimitableResource,
  limitType: LimitType,
  accessToken: string
): Promise<void> => {

  const currentCount = await getResourceCountFromDB(
    tableName,
    orgId,
    accessToken,
    limitType === "store_limit"
  );

  await checkResourceLimit(
    orgId,
    resource,
    currentCount,
    limitType,
    accessToken
  );
};
