import type {
  AnalyticsData,
  AnalyticsParams,
} from "../../types/analytics";
import { getAnalyticsOverview } from "./overview.analytics";
import { getSalesAnalytics } from "./sales.analytics";
import { getLeadAnalytics } from "./leads.analytics";
import { getContactCustomerAnalytics } from "./contacts.analytics";
import { getActivityAnalytics } from "./activity.analytics";
import { getTeamAnalytics } from "./team.analytics";
import { getTaskAnalytics } from "./tasks.analytics";
import { getCRMHealthAnalytics } from "./health.analytics";
import { getFunnelAnalytics } from "./funnel.analytics";
import { getCohortAnalytics } from "./cohorts.analytics";
import { getRevenueAnalytics } from "./revenue.analytics";
import { getEngagementAnalytics } from "./engagement.analytics";
import { getBreakdownAnalytics } from "./breakdown.analytics";
import { getConversionTimeAnalytics } from "./conversion-time.analytics";
import { getForecastingAnalytics } from "./forecasting.analytics";
import { getAttributionAnalytics } from "./attribution.analytics";
import { getAnomalyAnalytics } from "./anomalies.analytics";

export const getAnalyticsFromDB = async ({
  orgId,
  accessToken,
  memberId,
  role,
  filters,
}: AnalyticsParams): Promise<AnalyticsData> => {
  const scope = role === "agent" ? "user" : "organization";
  const results = await Promise.allSettled([
    getAnalyticsOverview({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getSalesAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getLeadAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getContactCustomerAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getActivityAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getTeamAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getTaskAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getCRMHealthAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getFunnelAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getCohortAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getRevenueAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getEngagementAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getBreakdownAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getConversionTimeAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getForecastingAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getAttributionAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
    getAnomalyAnalytics({
      orgId,
      accessToken,
      memberId,
      role,
      filters,
    }),
  ]);

  const names = [
    "overview",
    "sales",
    "leads",
    "contacts",
    "activity",
    "team",
    "tasks",
    "health",
    "funnel",
    "cohorts",
    "revenue",
    "engagement",
    "breakdown",
    "conversionTime",
    "forecasting",
    "attribution",
    "anomalies",
  ];

  results.forEach((result, index) => {
    if (result.status === "rejected") {
      console.error(
        `Analytics service failed: ${names[index]}`,
        result.reason,
      );
    }
  });

  const failedResult = results.find(
    (result) => result.status === "rejected",
  );

  if (failedResult?.status === "rejected") {
    throw failedResult.reason;
  }

  const getResult = <T>(
    result: PromiseSettledResult<T>,
    name: string,
  ): T => {
    if (result.status === "rejected") {
      throw result.reason;
    }

    return result.value;
  };

  const overview = getResult(results[0], "overview");
  const sales = getResult(results[1], "sales");
  const leads = getResult(results[2], "leads");
  const contacts = getResult(results[3], "contacts");
  const activity = getResult(results[4], "activity");
  const team = getResult(results[5], "team");
  const tasks = getResult(results[6], "tasks");
  const health = getResult(results[7], "health");
  const funnel = getResult(results[8], "funnel");
  const cohorts = getResult(results[9], "cohorts");
  const revenue = getResult(results[10], "revenue");
  const engagement = getResult(results[11], "engagement");
  const breakdown = getResult(results[12], "breakdown");
  const conversionTime = getResult(results[13],"conversionTime",);
  const forecasting = getResult(results[14],"forecasting");
  const attribution = getResult(results[15],"attribution",);
  const anomalies = getResult(results[16],"anomalies",);

  return {
    scope,
    role,
    filters,
    overview,
    sales,
    leads,
    contacts,
    activity,
    team,
    tasks,
    health,
    funnel,
    cohorts,
    conversionTime,
    revenue,
    forecasting,
    attribution,
    engagement,
    anomalies,
    breakdown,
  };
};