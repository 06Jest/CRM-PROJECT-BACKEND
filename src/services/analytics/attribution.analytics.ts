import type {
  AnalyticsParams,
  AttributionAnalytics,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

interface LeadRecord {
  id: string;
  source: string | null;
  converted_at: string | null;
}

interface ContactRecord {
  id: string;
  lead_id: string | null;
}

interface DealRecord {
  contact_id: string;
  stage: string;
  value: number | null;
  won_at: string | null;
}

export const getAttributionAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<AttributionAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const { data: leads, error: leadsError } = await supabase
    .from(table.leads)
    .select("id, source, converted_at")
    .is("deleted_at", null)
    .eq("is_archived", false)
    .gte("created_at", current.start.toISOString())
    .lte("created_at", current.end.toISOString());

  if (leadsError) {
    throw new Error(
      `Failed to fetch attribution leads: ${leadsError.message}`,
    );
  }

  const leadRecords = (leads ?? []) as LeadRecord[];

  if (leadRecords.length === 0) {
    return {
      available: false,
      reason:
        "Attribution analytics require leads with source information within the selected period.",
      sources: [],
    };
  }

  const leadIds = leadRecords.map((lead) => lead.id);

  const { data: contacts, error: contactsError } =
    await supabase
      .from(table.contacts)
      .select("id, lead_id")
      .in("lead_id", leadIds)
      .is("deleted_at", null);

  if (contactsError) {
    throw new Error(
      `Failed to fetch attribution contacts: ${contactsError.message}`,
    );
  }

  const contactRecords =
    (contacts ?? []) as ContactRecord[];

  const contactIds = contactRecords.map(
    (contact) => contact.id,
  );

  let dealRecords: DealRecord[] = [];

  if (contactIds.length > 0) {
    const { data: deals, error: dealsError } =
      await supabase
        .from(table.deals)
        .select(
          "contact_id, stage, value, won_at",
        )
        .in("contact_id", contactIds)
        .is("deleted_at", null)
        .eq("is_archived", false)
        .eq("stage", "Closed Won")
        .not("won_at", "is", null)
        .gte(
          "won_at",
          current.start.toISOString(),
        )
        .lte(
          "won_at",
          current.end.toISOString(),
        );

    if (dealsError) {
      throw new Error(
        `Failed to fetch attribution deals: ${dealsError.message}`,
      );
    }

    dealRecords = (deals ?? []) as DealRecord[];
  }

  const contactToLead = new Map<string, string>();

  for (const contact of contactRecords) {
    if (contact.lead_id) {
      contactToLead.set(
        contact.id,
        contact.lead_id,
      );
    }
  }

  const sourceMap = new Map<
    string,
    {
      source: string;
      leads: number;
      convertedLeads: number;
      wonDeals: number;
      wonRevenue: number;
    }
  >();

  for (const lead of leadRecords) {
    const source = lead.source ?? "Unknown";

    if (
      filters.source &&
      source !== filters.source
    ) {
      continue;
    }

    const existing = sourceMap.get(source);

    if (existing) {
      existing.leads += 1;

      if (
        lead.converted_at &&
        new Date(lead.converted_at) <= current.end
      ) {
        existing.convertedLeads += 1;
      }
    } else {
      sourceMap.set(source, {
        source,
        leads: 1,
        convertedLeads:
          lead.converted_at &&
          new Date(lead.converted_at) <= current.end
            ? 1
            : 0,
        wonDeals: 0,
        wonRevenue: 0,
      });
    }
  }

  for (const deal of dealRecords) {
    const leadId = contactToLead.get(
      deal.contact_id,
    );

    if (!leadId) {
      continue;
    }

    const lead = leadRecords.find(
      (item) => item.id === leadId,
    );

    if (!lead) {
      continue;
    }

    const source = lead.source ?? "Unknown";

    if (
      filters.source &&
      source !== filters.source
    ) {
      continue;
    }

    const existing = sourceMap.get(source);

    if (!existing) {
      continue;
    }

    existing.wonDeals += 1;
    existing.wonRevenue += Number(
      deal.value ?? 0,
    );
  }

  const sources = Array.from(
    sourceMap.values(),
  )
    .map((source) => ({
      ...source,
      conversionRate:
        source.leads > 0
          ? Number(
              (
                (source.convertedLeads /
                  source.leads) *
                100
              ).toFixed(2),
            )
          : 0,
      wonRevenue: Number(
        source.wonRevenue.toFixed(2),
      ),
    }))
    .sort((a, b) => b.wonRevenue - a.wonRevenue);

  return {
    available: sources.length > 0,
    reason:
      sources.length === 0
        ? "No attributable lead sources were found within the selected period."
        : undefined,
    sources,
  };
};