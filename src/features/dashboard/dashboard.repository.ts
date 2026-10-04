import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";
import type { DashboardParams } from "./dashboard.types";

export const getDashboardDataFromDB = async ({
  orgId,
  accessToken,
}: Pick<DashboardParams, "orgId" | "accessToken">) => {
  const db = createSupabaseUserClient(accessToken);

  const membersPromise = db
    .from(table.orgmembers)
    .select(`
      id,
      profile_id,
      display_id,
      role,
      status,
      profiles:profile_id (
        display_name,
        first_name,
        last_name,
        avatar_url,
        job_title
      )
    `)
    .eq("org_id", orgId)
    .eq("status", "active")
    .is("deleted_at", null);

  const [
    leadsResult,
    contactsResult,
    customersResult,
    dealsResult,
    tasksResult,
    callsResult,
    emailsResult,
    smsResult,
    activitiesResult,
    contactActivitiesResult,
    membersResult,
  ] = await Promise.all([
    db
      .from(table.leads)
      .select(
        "id, display_id, first_name, last_name, status, priority, source, owner_id, assigned_to, created_at, updated_at, deleted_at, is_archived"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .eq("is_archived", false),

    db
      .from(table.contacts)
      .select(
        "id, display_id, first_name, last_name, priority, owner_id, assigned_to, created_at, updated_at, deleted_at, is_archived"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .eq("is_archived", false),

    db
      .from(table.customers)
      .select(
        "id, contact_id, status, owner_id, assigned_to, created_at, updated_at, deleted_at, is_archived"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .eq("is_archived", false),

    db
      .from(table.deals)
      .select(
        "id, display_id, title, stage, value, owner_id, assigned_to, created_at, updated_at, close_date, deleted_at, is_archived"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .eq("is_archived", false),

    db
      .from(table.tasks)
      .select(
        "id, assigned_to, status, priority, due_date, created_at, updated_at, deleted_at, is_archived"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .eq("is_archived", false),

    db
      .from(table.calls)
      .select(
        "id, assigned_to, created_by, status, priority, scheduled_for, created_at, updated_at, deleted_at, is_archived"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .eq("is_archived", false),

    db
      .from(table.emails)
      .select(
        "id, sender_id, lead_id, contact_id, customer_id, status, sent_at, created_at, updated_at, deleted_at"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null),

    db
      .from(table.sms)
      .select(
        "id, sender_id, lead_id, contact_id, status, created_at, updated_at, deleted_at, is_archived"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .eq("is_archived", false),

    db
      .from(table.activities)
      .select(
        "id, type, action, title, description, target_name, contact_id, lead_id, customer_id, created_by, created_at, updated_at, deleted_at"
      )
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(50),

    db
      .from(table.activities)
      .select("contact_id, created_at")
      .eq("org_id", orgId)
      .is("deleted_at", null)
      .not("contact_id", "is", null)
      .order("created_at", { ascending: false }),

    membersPromise,
  ]);

  const queryResults = [
    ["members", membersResult],
    ["leads", leadsResult],
    ["contacts", contactsResult],
    ["customers", customersResult],
    ["deals", dealsResult],
    ["tasks", tasksResult],
    ["calls", callsResult],
    ["emails", emailsResult],
    ["sms", smsResult],
    ["activities", activitiesResult],
    ["contact activities", contactActivitiesResult],
  ] as const;

  for (const [name, result] of queryResults) {
    if (result.error) {
      throw new Error(
        `Failed to fetch dashboard ${name}: ${result.error.message}`
      );
    }
  }

  return {
    members: membersResult.data ?? [],
    leads: leadsResult.data ?? [],
    contacts: contactsResult.data ?? [],
    customers: customersResult.data ?? [],
    deals: dealsResult.data ?? [],
    tasks: tasksResult.data ?? [],
    calls: callsResult.data ?? [],
    emails: emailsResult.data ?? [],
    sms: smsResult.data ?? [],
    activities: activitiesResult.data ?? [],
    contactActivities: contactActivitiesResult.data ?? [],
  };
};