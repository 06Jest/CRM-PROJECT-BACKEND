import type {
  AnalyticsParams,
  SalesAnalytics,
  SalesStageMetric,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

export const getSalesAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<SalesAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const { data, error } = await supabase
    .from(table.deals)
    .select("stage, value")
    .is("deleted_at", null)
    .eq("is_archived", false)
    .gte("created_at", current.start.toISOString())
    .lte("created_at", current.end.toISOString());

  if (error) {
    throw new Error(
      `Failed to fetch sales analytics: ${error.message}`,
    );
  }

  const stageMap = new Map<string, SalesStageMetric>();

  for (const deal of data ?? []) {
    const stage = deal.stage ?? "Unknown";
    const value = Number(deal.value ?? 0);

    const existing = stageMap.get(stage);

    if (existing) {
      existing.count += 1;
      existing.value += value;
    } else {
      stageMap.set(stage, {
        stage,
        count: 1,
        value,
      });
    }
  }

  const stages = Array.from(stageMap.values()).sort(
    (a, b) => b.value - a.value,
  );

  return {
    available: true,
    stages,
    totalValue: stages.reduce(
      (total, stage) => total + stage.value,
      0,
    ),
    totalDeals: stages.reduce(
      (total, stage) => total + stage.count,
      0,
    ),
  };
};