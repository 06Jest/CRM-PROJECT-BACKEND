import type {
  AnalyticsBreakdown,
  AnalyticsParams,
} from "../../types/analytics";
import { getAnalyticsDimension } from "./analytics.dimensions";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";
import { resolveAnalyticsFilters } from "./analyticsFilters";

const getDimensionValue = (
  row: unknown,
  column: string,
): string => {
  if (
    typeof row !== "object" ||
    row === null ||
    !(column in row)
  ) {
    return "Unknown";
  }

  const value = (row as Record<string, unknown>)[column];

  return typeof value === "string" && value.trim()
    ? value.trim()
    : "Unknown";
};



export const getBreakdownAnalytics = async (
  params: AnalyticsParams,
): Promise<AnalyticsBreakdown> => {
  const dimension =
    params.filters.dimension ?? "industry";
  const filterContext = resolveAnalyticsFilters(params.filters);
  const startDate = filterContext.current.start.toISOString();
  const endDate = filterContext.current.end.toISOString();
  const definition = getAnalyticsDimension(dimension);
  console.log(definition)

  if (!definition.leadColumn) {
    return {
      available: false,
      reason: `The ${definition.label} dimension is not available for leads.`,
      dimension,
      rows: [],
    };
  }

  const supabase = createSupabaseUserClient(
    params.accessToken,
  );

  // -------------------------
  // Leads
  // -------------------------

  const { data, error } = await supabase
    .from(table.leads)
    .select(definition.leadColumn)
    .eq("org_id", params.orgId)
    .is("deleted_at", null)
    .eq("is_archived", false)
    .gte("created_at", startDate)
    .lte("created_at", endDate);

  if (error) {
    throw error;
  }

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    const key = getDimensionValue(
      row,
      definition.leadColumn,
    );

    counts.set(
      key,
      (counts.get(key) ?? 0) + 1,
    );
  }

  // -------------------------
  // Contacts
  // -------------------------

  const { data: contactData, error: contactError } =
    await supabase
      .from(table.contacts)
      .select(definition.contactColumn!)
      .eq("org_id", params.orgId)
      .is("deleted_at", null)
      .eq("is_archived", false)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

  if (contactError) {
    throw contactError;
  }

  const contactCounts = new Map<string, number>();

  for (const row of contactData ?? []) {
    const key = getDimensionValue(
      row,
      definition.contactColumn!,
    );

    contactCounts.set(
      key,
      (contactCounts.get(key) ?? 0) + 1,
    );
  }

  // -------------------------
  // Activities
  // -------------------------

  const { data: activityData, error: activityError } =
    await supabase
      .from(table.activities)
      .select("lead_id, contact_id")
      .eq("org_id", params.orgId)
      .is("deleted_at", null)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

  if (activityError) {
    throw activityError;
  }

  const leadIds = new Set(
    (activityData ?? [])
      .map((activity) => activity.lead_id)
      .filter(Boolean),
  );

  const contactIds = new Set(
    (activityData ?? [])
      .map((activity) => activity.contact_id)
      .filter(Boolean),
  );

  // -------------------------
  // Active Leads
  // -------------------------

  const activeLeadCounts = new Map<string, number>();
  const activeContactCounts = new Map<string, number>();

  if (leadIds.size > 0 && definition.leadColumn) {
    const {
      data: activeLeads,
      error: activeLeadsError,
    } = await supabase
      .from(table.leads)
      .select("*")
      .in("id", Array.from(leadIds))
      .is("deleted_at", null)
      .eq("is_archived", false);

    if (activeLeadsError) {
      throw activeLeadsError;
    }

    for (const row of activeLeads ?? []) {
      const key = getDimensionValue(
        row,
        definition.leadColumn,
      );

      activeLeadCounts.set(
        key,
        (activeLeadCounts.get(key) ?? 0) + 1,
      );
    }
  }

  // -------------------------
  // Active Contacts
  // -------------------------

  if (
    contactIds.size > 0 &&
    definition.contactColumn
  ) {
    const {
      data: activeContacts,
      error: activeContactsError,
    } = await supabase
      .from(table.contacts)
      .select("*")
      .in("id", Array.from(contactIds))
      .is("deleted_at", null)
      .eq("is_archived", false);

    if (activeContactsError) {
      throw activeContactsError;
    }

   for (const row of activeContacts ?? []) {
      const key = getDimensionValue(
        row,
        definition.contactColumn!,
      );

      activeContactCounts.set(
        key,
        (activeContactCounts.get(key) ?? 0) + 1,
      );
    }
  }

  const { data: customerData, error: customerError } =
    await supabase
      .from(table.customers)
      .select("contact_id")
      .eq("org_id", params.orgId)
      .is("deleted_at", null)
      .eq("is_archived", false)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

  if (customerError) {
    throw customerError;
  }

  const customerContactIds = new Set(
    (customerData ?? [])
      .map((customer) => customer.contact_id)
      .filter(Boolean),
  );

  const customerCounts = new Map<string, number>();

  if (
    customerContactIds.size > 0 &&
    definition.contactColumn
  ) {
    const {
      data: customerContacts,
      error: customerContactsError,
    } = await supabase
      .from(table.contacts)
      .select(`id, ${definition.contactColumn}`)
      .in("id", Array.from(customerContactIds))
      .is("deleted_at", null)
      .eq("is_archived", false);

    if (customerContactsError) {
      throw customerContactsError;
    }

    for (const row of customerContacts ?? []) {
      const key = getDimensionValue(
        row,
        definition.contactColumn,
      );

      customerCounts.set(
        key,
        (customerCounts.get(key) ?? 0) + 1,
      );
    }
  }

  const { data: dealData, error: dealError } =
    await supabase
      .from(table.deals)
      .select("contact_id, value")
      .eq("org_id", params.orgId)
      .eq("stage", "Closed Won")
      .is("deleted_at", null)
      .eq("is_archived", false)
      .gte("created_at", startDate)
      .lte("created_at", endDate);

  if (dealError) {
    throw dealError;
  }

  const dealContactIds = new Set(
    (dealData ?? [])
      .map((deal) => deal.contact_id)
      .filter(Boolean),
  );

  const dealCounts = new Map<string, number>();
  const dealRevenue = new Map<string, number>();

  if (
    dealContactIds.size > 0 &&
    definition.contactColumn
  ) {
    const {
    data: dealContacts,
    error: dealContactsError,
  } = await supabase
    .from(table.contacts)
    .select("*")
    .in("id", Array.from(dealContactIds))
    .is("deleted_at", null)
    .eq("is_archived", false);

    if (dealContactsError) {
      throw dealContactsError;
    }

    const contactDimensionMap = new Map<string, string>();

    for (const row of dealContacts ?? []) {
      const dimensionValue = getDimensionValue(
        row,
        definition.contactColumn,
      );

      contactDimensionMap.set(
        String(row.id),
        dimensionValue,
      );
    }

    for (const deal of dealData ?? []) {
      const dimensionValue = contactDimensionMap.get(
        String(deal.contact_id),
      );

      if (!dimensionValue) {
        continue;
      }

      dealCounts.set(
        dimensionValue,
        (dealCounts.get(dimensionValue) ?? 0) + 1,
      );

      const value =
        typeof deal.value === "number"
          ? deal.value
          : Number(deal.value ?? 0);

      dealRevenue.set(
        dimensionValue,
        (dealRevenue.get(dimensionValue) ?? 0) + value,
      );
    }
  }

  // -------------------------
  // Build rows
  // -------------------------

  const dimensionKeys = new Set([
    ...counts.keys(),
    ...contactCounts.keys(),
    ...customerCounts.keys(),
    ...dealCounts.keys(),
  ]);

  const rows = Array.from(dimensionKeys)
    .map((dimensionValue) => ({
      dimension: dimensionValue,
      leads: counts.get(dimensionValue) ?? 0,
      contacts:
        contactCounts.get(dimensionValue) ?? 0,
      active:
        (activeLeadCounts.get(dimensionValue) ?? 0) +
        (activeContactCounts.get(dimensionValue) ?? 0),
      customers:
        customerCounts.get(dimensionValue) ?? 0,
      wonDeals:
        dealCounts.get(dimensionValue) ?? 0,
      wonRevenue:
        dealRevenue.get(dimensionValue) ?? 0,
    }))
    .sort((a, b) => b.leads - a.leads);

  return {
    available: true,
    dimension,
    rows,
  };
};