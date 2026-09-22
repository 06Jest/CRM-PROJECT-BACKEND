import type {
  AnalyticsParams,
  ContactCustomerAnalytics,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

const getCount = async (
  supabase: ReturnType<typeof createSupabaseUserClient>,
  tableName: string,
  start: Date,
  end: Date,
  hasArchiveFlag = false,
) => {
  let query = supabase
    .from(tableName)
    .select("id", { count: "exact", head: true })
    .gte("created_at", start.toISOString())
    .lte("created_at", end.toISOString())
    .is("deleted_at", null);

  if (hasArchiveFlag) {
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

export const getContactCustomerAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<ContactCustomerAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const [contacts, customers] = await Promise.all([
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
      true,
    ),
  ]);

  return {
    available: true,
    contacts: {
      total: contacts,
    },
    customers: {
      total: customers,
    },
  };
};