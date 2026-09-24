import type {
  AnalyticsParams,
  ForecastAnalytics,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

const STAGE_WEIGHTS: Record<string, number> = {
  Prospecting: 0.2,
  Proposal: 0.5,
  Negotiation: 0.75,
};

const getWonRevenue = async (
  supabase: ReturnType<typeof createSupabaseUserClient>,
  start: Date,
  end: Date,
) => {
  const { data, error } = await supabase
    .from(table.deals)
    .select("value")
    .eq("stage", "Closed Won")
    .is("deleted_at", null)
    .eq("is_archived", false)
    .not("won_at", "is", null)
    .gte("won_at", start.toISOString())
    .lte("won_at", end.toISOString());

  if (error) {
    throw new Error(
      `Failed to fetch forecast revenue: ${error.message}`,
    );
  }

  return (data ?? []).reduce(
    (total, deal) => total + Number(deal.value ?? 0),
    0,
  );
};

export const getForecastingAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<ForecastAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current, comparison } =
    resolveAnalyticsFilters(filters);

  const [historicalRevenue, previousRevenue] =
    await Promise.all([
      getWonRevenue(
        supabase,
        current.start,
        current.end,
      ),

      comparison
        ? getWonRevenue(
            supabase,
            comparison.start,
            comparison.end,
          )
        : Promise.resolve(undefined),
    ]);

  const growthRate =
    previousRevenue !== undefined &&
    previousRevenue > 0
      ? (historicalRevenue - previousRevenue) /
        previousRevenue
      : 0;

  const projected =
    previousRevenue !== undefined &&
    previousRevenue > 0
      ? historicalRevenue * (1 + growthRate)
      : historicalRevenue;

  const { data: openDeals, error: pipelineError } =
    await supabase
      .from(table.deals)
      .select("stage, value")
      .is("deleted_at", null)
      .eq("is_archived", false)
      .not(
        "stage",
        "in",
        '("Closed Won","Closed Lost")',
      );

  if (pipelineError) {
    throw new Error(
      `Failed to fetch forecast pipeline: ${pipelineError.message}`,
    );
  }

  let openValue = 0;
  let weightedValue = 0;

  for (const deal of openDeals ?? []) {
    const value = Number(deal.value ?? 0);
    const weight = STAGE_WEIGHTS[deal.stage] ?? 0;

    openValue += value;
    weightedValue += value * weight;
  }

  return {
    available:
      historicalRevenue > 0 ||
      openValue > 0,

    reason:
      historicalRevenue === 0 &&
      openValue === 0
        ? "Forecasting requires historical won revenue or open pipeline data."
        : undefined,

    revenue: {
      historical: Number(historicalRevenue.toFixed(2)),
      projected: Number(projected.toFixed(2)),
      growthRate: Number(growthRate.toFixed(4)),
    },

    pipeline: {
      openValue: Number(openValue.toFixed(2)),
      weightedValue: Number(
        weightedValue.toFixed(2),
      ),
    },
  };
};