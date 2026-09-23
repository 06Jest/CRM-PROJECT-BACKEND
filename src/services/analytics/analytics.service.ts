// import type {
//   AnalyticsData,
//   AnalyticsParams,
// } from "../../types/analytics";
// import { getAnalyticsOverview } from "./overview.analytics";
// import { getSalesAnalytics } from "./sales.analytics";
// import { getLeadAnalytics } from "./leads.analytics";
// import { getContactCustomerAnalytics } from "./contacts.analytics";
// import { getActivityAnalytics } from "./activity.analytics";
// import { getTeamAnalytics } from "./team.analytics";
// import { getTaskAnalytics } from "./tasks.analytics";
// import { getCRMHealthAnalytics } from "./health.analytics";
// import { getFunnelAnalytics } from "./funnel.analytics";
// import { getCohortAnalytics } from "./cohorts.analytics";
// import { getRevenueAnalytics } from "./revenue.analytics";
// import { getEngagementAnalytics } from "./engagement.analytics";
// import { getBreakdownAnalytics } from "./breakdown.analytics";

// export const getAnalyticsFromDB = async ({
//   orgId,
//   accessToken,
//   memberId,
//   role,
//   filters,
// }: AnalyticsParams): Promise<AnalyticsData> => {

//   const scope = role === "agent" ? "user" : "organization";

//   const [
//     overview,
//     sales,
//     leads,
//     contacts,
//     activity,
//     team,
//     tasks,
//     health,
//     funnel,
//     cohorts,
//     revenue,
//     engagement,
//     breakdown,
//   ] = await Promise.all([
//     getAnalyticsOverview({ orgId, accessToken, memberId, role, filters }),
//     getSalesAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getLeadAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getContactCustomerAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getActivityAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getTeamAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getTaskAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getCRMHealthAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getFunnelAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getCohortAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getRevenueAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getEngagementAnalytics({ orgId, accessToken, memberId, role, filters }),
//     getBreakdownAnalytics({orgId, accessToken, memberId, role, filters,}),
//   ]);

//   return {
//     scope,
//     role,
//     filters,
//     overview,
//     sales,
//     leads,
//     contacts,
//     activity,
//     team,
//     tasks,
//     health,
//     funnel,
//     cohorts,

//     conversionTime: {
//       available: false,
//       reason:
//         "Conversion time analytics require reliable lifecycle history, which is not currently available.",
//     },

//     revenue,

//     forecasting: {
//       available: false,
//       reason:"Forecasting analytics require sufficient historical time-series data and a defined forecasting methodology.",
//     },

//     attribution: {
//       available: false,
//       reason: "Attribution analytics require reliable source-to-outcome relationships, which are not currently available.",
//     },

//     engagement,

//     anomalies: {
//       available: false,
//       reason: "Anomaly analytics require sufficient historical baseline data and defined detection rules.",
//     },
//     breakdown,
//   };
// };


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

    conversionTime: {
      available: false,
      reason:
        "Conversion time analytics require reliable lifecycle history, which is not currently available.",
    },

    revenue,

    forecasting: {
      available: false,
      reason:
        "Forecasting analytics require sufficient historical time-series data and a defined forecasting methodology.",
    },

    attribution: {
      available: false,
      reason:
        "Attribution analytics require reliable source-to-outcome relationships, which are not currently available.",
    },

    engagement,

    anomalies: {
      available: false,
      reason:
        "Anomaly analytics require sufficient historical baseline data and defined detection rules.",
    },

    breakdown,
  };
};