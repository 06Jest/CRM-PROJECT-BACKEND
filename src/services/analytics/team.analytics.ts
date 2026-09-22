import type {
  AnalyticsParams,
  TeamAnalytics,
  TeamMemberAnalytics,
} from "../../types/analytics";
import { resolveAnalyticsFilters } from "./analyticsFilters";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

export const getTeamAnalytics = async ({
  accessToken,
  filters,
}: AnalyticsParams): Promise<TeamAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const { current } = resolveAnalyticsFilters(filters);

  const { data: members, error: membersError } = await supabase
    .from(table.orgmembers)
    .select(`
      id,
      profile_id,
      role,
      profiles (
        first_name,
        last_name
      )
    `)
    .eq("status", "active")
    .is("deleted_at", null);

  if (membersError) {
    throw new Error(
      `Failed to fetch team analytics members: ${membersError.message}`,
    );
  }

  const memberStats = new Map<string, TeamMemberAnalytics>();

  for (const member of members ?? []) {
    memberStats.set(member.id, {
      memberId: member.id,
      profileId: member.profile_id,
      name: [
        member.profiles?.[0]?.first_name,
        member.profiles?.[0]?.last_name,
      ]
        .filter(Boolean)
        .join(" ") || "Unknown",
      leads: 0,
      contacts: 0,
      customers: 0,
      deals: 0,
      openDeals: 0,
      pipelineValue: 0,
      tasks: 0,
    });
  }

  const [leads, contacts, customers, deals, tasks] =
    await Promise.all([
      supabase
        .from(table.leads)
        .select("assigned_to, owner_id")
        .is("deleted_at", null)
        .eq("is_archived", false)
        .gte("created_at", current.start.toISOString())
        .lte("created_at", current.end.toISOString()),

      supabase
        .from(table.contacts)
        .select("owner_id")
        .is("deleted_at", null)
        .gte("created_at", current.start.toISOString())
        .lte("created_at", current.end.toISOString()),

      supabase
        .from(table.customers)
        .select("assigned_to, owner_id")
        .is("deleted_at", null)
        .eq("is_archived", false)
        .gte("created_at", current.start.toISOString())
        .lte("created_at", current.end.toISOString()),

      supabase
        .from(table.deals)
        .select("assigned_to, owner_id, stage, value")
        .is("deleted_at", null)
        .eq("is_archived", false)
        .gte("created_at", current.start.toISOString())
        .lte("created_at", current.end.toISOString()),

      supabase
        .from(table.tasks)
        .select("assigned_to")
        .is("deleted_at", null)
        .eq("is_archived", false)
        .gte("created_at", current.start.toISOString())
        .lte("created_at", current.end.toISOString()),
    ]);

  const results = [
    leads,
    contacts,
    customers,
    deals,
    tasks,
  ];

  for (const result of results) {
    if (result.error) {
      throw new Error(
        `Failed to fetch team analytics: ${result.error.message}`,
      );
    }
  }

  for (const lead of leads.data ?? []) {
    const memberId = lead.assigned_to ?? lead.owner_id;
    const stats = memberStats.get(memberId);

    if (stats) {
      stats.leads += 1;
    }
  }

  for (const contact of contacts.data ?? []) {
    const stats = memberStats.get(contact.owner_id);

    if (stats) {
      stats.contacts += 1;
    }
  }

  for (const customer of customers.data ?? []) {
    const memberId = customer.assigned_to ?? customer.owner_id;
    const stats = memberStats.get(memberId);

    if (stats) {
      stats.customers += 1;
    }
  }

  for (const deal of deals.data ?? []) {
    const memberId = deal.assigned_to ?? deal.owner_id;
    const stats = memberStats.get(memberId);

    if (stats) {
      stats.deals += 1;

      if (
        deal.stage !== "Closed Won" &&
        deal.stage !== "Closed Lost"
      ) {
        stats.openDeals += 1;
        stats.pipelineValue += Number(deal.value ?? 0);
      }
    }
  }

  for (const task of tasks.data ?? []) {
    const stats = memberStats.get(task.assigned_to);

    if (stats) {
      stats.tasks += 1;
    }
  }

  return {
    available: true,
    members: Array.from(memberStats.values()),
  };
};