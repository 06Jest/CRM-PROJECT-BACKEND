import type {
  AnalyticsParams,
  RevenueAnalytics,
} from "../../types/analytics";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";
import { resolveAnalyticsFilters } from "./analyticsFilters";

export const getRevenueAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<RevenueAnalytics> => {
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
      `Failed to fetch revenue analytics: ${error.message}`,
    );
  }

  const stageMap = new Map<
    string,
    { stage: string; value: number; count: number }
  >();

  for (const deal of data ?? []) {
    const stage = deal.stage ?? "Unknown";
    const value = Number(deal.value ?? 0);

    const existing = stageMap.get(stage);

    if (existing) {
      existing.value += value;
      existing.count += 1;
    } else {
      stageMap.set(stage, {
        stage,
        value,
        count: 1,
      });
    }
  }

  const revenueByStage = Array.from(stageMap.values()).sort(
    (a, b) => b.value - a.value,
  );

  const wonDeals = revenueByStage.find(
    (stage) => stage.stage === "Closed Won",
  )?.count ?? 0;

  const totalRevenue =
    revenueByStage.find((stage) => stage.stage === "Closed Won")?.value ?? 0;

  return {
    available: true,
    totalRevenue,
    wonDeals,
    averageDealValue: wonDeals > 0 ? totalRevenue / wonDeals : 0,
    revenueByStage,
  };
};