import type {
  AnalyticsParams,
  FunnelAnalytics,
  FunnelStageMetric,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

export const getFunnelAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<FunnelAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const { data, error } = await supabase
    .from(table.leads)
    .select("status")
    .is("deleted_at", null)
    .eq("is_archived", false)
    .gte("created_at", current.start.toISOString())
    .lte("created_at", current.end.toISOString());

  if (error) {
    throw new Error(
      `Failed to fetch funnel analytics: ${error.message}`,
    );
  }

  const stageMap = new Map<string, FunnelStageMetric>();

  for (const lead of data ?? []) {
    const stage = lead.status ?? "Unknown";

    const existing = stageMap.get(stage);

    if (existing) {
      existing.count += 1;
    } else {
      stageMap.set(stage, {
        stage,
        count: 1,
      });
    }
  }

  const stages = Array.from(stageMap.values()).sort(
    (a, b) => b.count - a.count,
  );

  return {
    available: true,
    stages,
  };
};