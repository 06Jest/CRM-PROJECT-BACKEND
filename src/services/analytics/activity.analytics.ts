import type {
  ActivityAnalytics,
  ActivityTypeMetric,
  AnalyticsParams,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

export const getActivityAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<ActivityAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const { data, error } = await supabase
    .from(table.activities)
    .select("type")
    .is("deleted_at", null)
    .gte("created_at", current.start.toISOString())
    .lte("created_at", current.end.toISOString());

  if (error) {
    throw new Error(
      `Failed to fetch activity analytics: ${error.message}`,
    );
  }

  const typeMap = new Map<string, ActivityTypeMetric>();

  for (const activity of data ?? []) {
    const type = activity.type ?? "Unknown";

    const existing = typeMap.get(type);

    if (existing) {
      existing.count += 1;
    } else {
      typeMap.set(type, {
        type,
        count: 1,
      });
    }
  }

  const types = Array.from(typeMap.values()).sort(
    (a, b) => b.count - a.count,
  );

  return {
    available: true,
    types,
    totalActivities: types.reduce(
      (total, activity) => total + activity.count,
      0,
    ),
  };
};