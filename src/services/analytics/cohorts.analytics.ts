import type {
  AnalyticsParams,
  CohortAnalytics,
  CohortMetric,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

export const getCohortAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<CohortAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const { data, error } = await supabase
    .from(table.customers)
    .select("created_at")
    .is("deleted_at", null)
    .eq("is_archived", false)
    .gte("created_at", current.start.toISOString())
    .lte("created_at", current.end.toISOString());

  if (error) {
    throw new Error(
      `Failed to fetch cohort analytics: ${error.message}`,
    );
  }

  const cohortMap = new Map<string, CohortMetric>();

  for (const customer of data ?? []) {
    if (!customer.created_at) {
      continue;
    }

    const date = new Date(customer.created_at);

    const cohort = `${date.getFullYear()}-${String(
      date.getMonth() + 1,
    ).padStart(2, "0")}`;

    const existing = cohortMap.get(cohort);

    if (existing) {
      existing.customers += 1;
    } else {
      cohortMap.set(cohort, {
        cohort,
        customers: 1,
      });
    }
  }

  const cohorts = Array.from(cohortMap.values()).sort(
    (a, b) => a.cohort.localeCompare(b.cohort),
  );

  return {
    available: true,
    cohorts,
  };
};