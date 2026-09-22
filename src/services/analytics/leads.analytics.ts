import type {
  AnalyticsParams,
  LeadAnalytics,
  LeadStatusMetric,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

export const getLeadAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<LeadAnalytics> => {
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
      `Failed to fetch lead analytics: ${error.message}`,
    );
  }

  const statusMap = new Map<string, LeadStatusMetric>();

  for (const lead of data ?? []) {
    const status = lead.status ?? "Unknown";

    const existing = statusMap.get(status);

    if (existing) {
      existing.count += 1;
    } else {
      statusMap.set(status, {
        status,
        count: 1,
      });
    }
  }

  const statuses = Array.from(statusMap.values()).sort(
    (a, b) => b.count - a.count,
  );

  return {
    available: true,
    statuses,
    totalLeads: statuses.reduce(
      (total, status) => total + status.count,
      0,
    ),
  };
};