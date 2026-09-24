import type {
  AnalyticsParams,
  ConversionTimeAnalytics,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

const calculateStats = (durations: number[]) => {
  if (durations.length === 0) {
    return {
      averageDays: 0,
      medianDays: 0,
      fastestDays: 0,
      slowestDays: 0,
      sampleSize: 0,
    };
  }

  const sorted = [...durations].sort((a, b) => a - b);

  const average =
    sorted.reduce((sum, value) => sum + value, 0) /
    sorted.length;

  const middle = Math.floor(sorted.length / 2);

  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];

  return {
    averageDays: Number(average.toFixed(2)),
    medianDays: Number(median.toFixed(2)),
    fastestDays: Number(sorted[0].toFixed(2)),
    slowestDays: Number(
      sorted[sorted.length - 1].toFixed(2),
    ),
    sampleSize: sorted.length,
  };
};

const getDurationDays = (
  start: string,
  end: string,
): number | null => {
  const startDate = new Date(start);
  const endDate = new Date(end);

  const duration =
    endDate.getTime() - startDate.getTime();

  if (
    Number.isNaN(duration) ||
    duration < 0
  ) {
    return null;
  }

  return duration / (1000 * 60 * 60 * 24);
};

export const getConversionTimeAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<ConversionTimeAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const [
    { data: leads, error: leadsError },
    { data: deals, error: dealsError },
  ] = await Promise.all([
    supabase
      .from(table.leads)
      .select("created_at, converted_at")
      .is("deleted_at", null)
      .eq("is_archived", false)
      .not("converted_at", "is", null)
      .gte("converted_at", current.start.toISOString())
      .lte("converted_at", current.end.toISOString()),

    supabase
      .from(table.deals)
      .select("created_at, won_at")
      .is("deleted_at", null)
      .eq("is_archived", false)
      .not("won_at", "is", null)
      .gte("won_at", current.start.toISOString())
      .lte("won_at", current.end.toISOString()),
  ]);

  if (leadsError) {
    throw new Error(
      `Failed to fetch lead conversion analytics: ${leadsError.message}`,
    );
  }

  if (dealsError) {
    throw new Error(
      `Failed to fetch deal conversion analytics: ${dealsError.message}`,
    );
  }

  const leadDurations = (leads ?? [])
    .map((lead) =>
      getDurationDays(
        lead.created_at,
        lead.converted_at!,
      ),
    )
    .filter(
      (value): value is number => value !== null,
    );

  const dealDurations = (deals ?? [])
    .map((deal) =>
      getDurationDays(
        deal.created_at,
        deal.won_at!,
      ),
    )
    .filter(
      (value): value is number => value !== null,
    );

  return {
    available:
      leadDurations.length > 0 ||
      dealDurations.length > 0,

    reason:
      leadDurations.length === 0 &&
      dealDurations.length === 0
        ? "Conversion time analytics require completed lead conversions or won deals within the selected period."
        : undefined,

    leads: calculateStats(leadDurations),
    deals: calculateStats(dealDurations),
  };
};