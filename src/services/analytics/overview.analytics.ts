import type {
  AnalyticsMetricWithComparison,
  AnalyticsOverview,
  AnalyticsParams,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

const createMetric = (
  value: number,
  previousValue?: number,
): AnalyticsMetricWithComparison => {
  if (previousValue === undefined) {
    return {
      value,
      available: true,
    };
  }

  const change = value - previousValue;

  return {
    value,
    previousValue,
    change,
    changePercent:
      previousValue === 0
        ? undefined
        : (change / previousValue) * 100,
    available: true,
  };
};

interface AnalyticsRecordOptions {
  hasArchiveFlag?: boolean;
}

const getCount = async (
  supabase: ReturnType<typeof createSupabaseUserClient>,
  tableName: string,
  start: Date,
  end: Date,
  options: AnalyticsRecordOptions = {},
) => {
  let query = supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .is("deleted_at", null);

  if (options.hasArchiveFlag) {
    query = query.eq("is_archived", false);
  }

  const { count, error } = await query;

  if (error) {
    throw new Error(
      `Failed to fetch ${tableName} analytics: ${error.message}`,
    );
  }

  return count ?? 0;
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
    .gte("close_date", start.toISOString())
    .lte("close_date", end.toISOString());

  if (error) {
    throw new Error(
      `Failed to fetch won revenue analytics: ${error.message}`,
    );
  }

  return (data ?? []).reduce(
    (total, deal) => total + Number(deal.value ?? 0),
    0,
  );
};

const getPipelineValue = async (
  supabase: ReturnType<typeof createSupabaseUserClient>,
  start: Date,
  end: Date,
) => {
  const { data, error } = await supabase
    .from(table.deals)
    .select("value")
    .not("stage", "in", '("Closed Won","Closed Lost")')
    .is("deleted_at", null)
    .eq("is_archived", false)
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString());

  if (error) {
    throw new Error(
      `Failed to fetch pipeline analytics: ${error.message}`,
    );
  }

  return (data ?? []).reduce(
    (total, deal) => total + Number(deal.value ?? 0),
    0,
  );
};

export const getAnalyticsOverview = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<AnalyticsOverview> => {
  const supabase = createSupabaseUserClient(accessToken);

  const filterContext = resolveAnalyticsFilters(filters);
  const { current, comparison } = filterContext;

  const [
  totalLeads,
  totalContacts,
  totalCustomers,
  totalDeals,
  wonRevenue,
  pipelineValue,
  ] = await Promise.all([
    getCount(
      supabase,
      table.leads,
      current.start,
      current.end,
      { hasArchiveFlag: true },
    ),
    getCount(
      supabase,
      table.contacts,
      current.start,
      current.end,
    ),
    getCount(
      supabase,
      table.customers,
      current.start,
      current.end,
      { hasArchiveFlag: true },
    ),
    getCount(
      supabase,
      table.deals,
      current.start,
      current.end,
      { hasArchiveFlag: true },
    ),
    getWonRevenue(
      supabase,
      current.start,
      current.end,
    ),
    getPipelineValue(
      supabase,
      current.start,
      current.end,
    ),
  ]);

  let previousLeads: number | undefined;
  let previousContacts: number | undefined;
  let previousCustomers: number | undefined;
  let previousDeals: number | undefined;
  let previousWonRevenue: number | undefined;
  let previousPipelineValue: number | undefined;
  

  if (comparison) {
    [
      previousLeads,
      previousContacts,
      previousCustomers,
      previousDeals,
    ] = await Promise.all([
      getCount(
        supabase,
        table.leads,
        comparison.start,
        comparison.end,
        { hasArchiveFlag: true },
      ),
      getCount(
        supabase,
        table.contacts,
        comparison.start,
        comparison.end,
      ),
      getCount(
        supabase,
        table.customers,
        comparison.start,
        comparison.end,
        { hasArchiveFlag: true },
      ),
      getCount(
        supabase,
        table.deals,
        comparison.start,
        comparison.end,
        { hasArchiveFlag: true },
      ),
    ]);
    
    [previousPipelineValue, previousWonRevenue] =
    await Promise.all([
      getPipelineValue(
        supabase,
        comparison.start,
        comparison.end,
      ),
      getWonRevenue(
        supabase,
        comparison.start,
        comparison.end,
      ),
    ]);
  }

  return {
    totalLeads: createMetric(
      totalLeads,
      previousLeads,
    ),
    totalContacts: createMetric(
      totalContacts,
      previousContacts,
    ),
    totalCustomers: createMetric(
      totalCustomers,
      previousCustomers,
    ),
    totalDeals: createMetric(
      totalDeals,
      previousDeals,
    ),
    wonRevenue: createMetric(
      wonRevenue,
      previousWonRevenue,
    ),
    pipelineValue: createMetric(
      pipelineValue,
      previousPipelineValue,
    ),
  };
};