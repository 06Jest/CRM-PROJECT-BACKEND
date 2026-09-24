import type {
  AnalyticsParams,
  AnomalyAnalytics,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

interface MetricComparison {
  metric: string;
  currentValue: number;
  baselineValue: number;
}

const getSeverity = (
  deviationPercent: number,
): "low" | "medium" | "high" => {
  if (deviationPercent >= 100) {
    return "high";
  }

  if (deviationPercent >= 50) {
    return "medium";
  }

  return "low";
};

const compareMetric = ({
  metric,
  currentValue,
  baselineValue,
}: MetricComparison) => {
  if (
    currentValue === 0 &&
    baselineValue === 0
  ) {
    return null;
  }

  if (baselineValue === 0) {
    return null;
  }

  const deviationPercent =
    (Math.abs(currentValue - baselineValue) /
      Math.abs(baselineValue)) *
    100;

  // Ignore normal fluctuations below 25%.
  if (deviationPercent < 25) {
    return null;
  }

  return {
    metric,
    currentValue,
    baselineValue,
    deviationPercent: Number(
      deviationPercent.toFixed(2),
    ),
    direction:
      currentValue >= baselineValue
        ? ("increase" as const)
        : ("decrease" as const),
    severity: getSeverity(
      deviationPercent,
    ),
  };
};

const getPeriodMetrics = async (
  supabase: ReturnType<typeof createSupabaseUserClient>,
  start: Date,
  end: Date,
) => {
  const [
    { count: leads, error: leadsError },
    { count: deals, error: dealsError },
    { count: activities, error: activitiesError },
    { data: wonDeals, error: revenueError },
  ] = await Promise.all([
    supabase
      .from(table.leads)
      .select("id", {
        count: "exact",
        head: true,
      })
      .is("deleted_at", null)
      .eq("is_archived", false)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),

    supabase
      .from(table.deals)
      .select("id", {
        count: "exact",
        head: true,
      })
      .is("deleted_at", null)
      .eq("is_archived", false)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),

    supabase
      .from(table.activities)
      .select("id", {
        count: "exact",
        head: true,
      })
      .is("deleted_at", null)
      .gte("created_at", start.toISOString())
      .lte("created_at", end.toISOString()),

    supabase
      .from(table.deals)
      .select("value")
      .eq("stage", "Closed Won")
      .is("deleted_at", null)
      .eq("is_archived", false)
      .not("won_at", "is", null)
      .gte("won_at", start.toISOString())
      .lte("won_at", end.toISOString()),
  ]);

  if (leadsError) {
    throw new Error(
      `Failed to fetch anomaly lead metrics: ${leadsError.message}`,
    );
  }

  if (dealsError) {
    throw new Error(
      `Failed to fetch anomaly deal metrics: ${dealsError.message}`,
    );
  }

  if (activitiesError) {
    throw new Error(
      `Failed to fetch anomaly activity metrics: ${activitiesError.message}`,
    );
  }

  if (revenueError) {
    throw new Error(
      `Failed to fetch anomaly revenue metrics: ${revenueError.message}`,
    );
  }

  const wonRevenue = (wonDeals ?? []).reduce(
    (total, deal) =>
      total + Number(deal.value ?? 0),
    0,
  );

  return {
    leads: leads ?? 0,
    deals: deals ?? 0,
    activities: activities ?? 0,
    wonRevenue,
  };
};

export const getAnomalyAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<AnomalyAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const {
    current,
    comparison,
  } = resolveAnalyticsFilters(filters);

  if (!comparison) {
    return {
      available: false,
      reason:
        "Anomaly analytics require a comparison period.",
      anomalies: [],
    };
  }

  const [
    currentMetrics,
    baselineMetrics,
  ] = await Promise.all([
    getPeriodMetrics(
      supabase,
      current.start,
      current.end,
    ),

    getPeriodMetrics(
      supabase,
      comparison.start,
      comparison.end,
    ),
  ]);

  const comparisons: MetricComparison[] = [
    {
      metric: "Lead volume",
      currentValue: currentMetrics.leads,
      baselineValue: baselineMetrics.leads,
    },
    {
      metric: "Deal volume",
      currentValue: currentMetrics.deals,
      baselineValue: baselineMetrics.deals,
    },
    {
      metric: "Activity volume",
      currentValue: currentMetrics.activities,
      baselineValue: baselineMetrics.activities,
    },
    {
      metric: "Won revenue",
      currentValue: currentMetrics.wonRevenue,
      baselineValue: baselineMetrics.wonRevenue,
    },
  ];

  const anomalies = comparisons
    .map(compareMetric)
    .filter(
      (
        anomaly,
      ): anomaly is NonNullable<
        ReturnType<typeof compareMetric>
      > => anomaly !== null,
    );

  return {
    available: true,
    reason:
      anomalies.length === 0
        ? "No significant period-over-period deviations were detected."
        : undefined,
    anomalies,
  };
};