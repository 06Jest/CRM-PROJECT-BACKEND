import type {
  AnalyticsParams,
  EngagementAnalytics,
} from "../../types/analytics";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";
import { resolveAnalyticsFilters } from "./analyticsFilters";

export const getEngagementAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<EngagementAnalytics> => {
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
      `Failed to fetch engagement analytics: ${error.message}`,
    );
  }

  const typeMap = new Map<string, number>();

  for (const activity of data ?? []) {
    const type = activity.type ?? "Unknown";
    typeMap.set(type, (typeMap.get(type) ?? 0) + 1);
  }

  const byType = Array.from(typeMap.entries())
    .map(([type, count]) => ({
      type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    available: true,
    totalActivities: data?.length ?? 0,
    byType,
  };
};