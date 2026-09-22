import { createSupabaseUserClient } from "../config/supabase";
import { table } from "../config/tables";
import type {
  DashboardData,
  DashboardParams,
} from "../types/dashboard";

export const getDashboardFromDB = async ({
  orgId,
  accessToken,
  memberId,
  role,
}: DashboardParams): Promise<DashboardData> => {
  const db = createSupabaseUserClient(accessToken);

  const scope = role === "agent" ? "user" : "organization";

  const { data: members, error: membersError } = await db
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

  if (membersError) {
    throw new Error(
      `Failed to fetch dashboard members: ${membersError.message}`
    );
  }

  const dashboardMembers = (members ?? []).map((member) => {
    const profile = Array.isArray(member.profiles)
      ? member.profiles[0]
      : member.profiles;

    const name =
      profile?.display_name ||
      [profile?.first_name, profile?.last_name]
        .filter(Boolean)
        .join(" ") ||
      "Unknown User";

    return {
      memberId: member.id,
      profileId: member.profile_id,
      displayId: member.display_id,
      name,
      avatarUrl: profile?.avatar_url ?? null,
      jobTitle: profile?.job_title ?? null,
      role: member.role,
    };
  });

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
  ]);

  const queryResults = [
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

  const now = new Date();
  const inactiveThreshold = new Date(now);
  inactiveThreshold.setDate(inactiveThreshold.getDate() - 30);

  const memberStats = new Map(
    dashboardMembers.map((member) => [
      member.memberId,
      {
        ...member,
        leads: 0,
        contacts: 0,
        customers: 0,
        openDeals: 0,
        pipelineValue: 0,
        openTasks: 0,
        overdueTasks: 0,
        scheduledCalls: 0,
        completedCalls: 0,
        emailsSent: 0,
        smsSent: 0,
      },
    ])
  );

  const leads = leadsResult.data ?? [];
  const contacts = contactsResult.data ?? [];
  const customers = customersResult.data ?? [];
  const deals = dealsResult.data ?? [];
  const tasks = tasksResult.data ?? [];
  const calls = callsResult.data ?? [];
  const emails = emailsResult.data ?? [];
  const sms = smsResult.data ?? [];
  const activities = activitiesResult.data ?? [];
  const contactActivities = contactActivitiesResult.data ?? [];

  for (const lead of leads) {
    const memberId = lead.assigned_to ?? lead.owner_id;

    if (!memberId) continue;

    const member = memberStats.get(memberId);

    if (member) {
      member.leads += 1;
    }
  }

  for (const contact of contacts) {
    const memberId = contact.assigned_to ?? contact.owner_id;

    if (!memberId) continue;

    const member = memberStats.get(memberId);

    if (member) {
      member.contacts += 1;
    }
  }

  for (const customer of customers) {
    const memberId = customer.assigned_to ?? customer.owner_id;

    if (!memberId) continue;

    const member = memberStats.get(memberId);

    if (member) {
      member.customers += 1;
    }
  }
  
  for (const deal of deals) {
    const memberId = deal.assigned_to ?? deal.owner_id;

    if (!memberId) continue;

    const member = memberStats.get(memberId);

    if (!member) continue;

    const isOpen =
      deal.stage !== "Closed Won" &&
      deal.stage !== "Closed Lost";

    if (isOpen) {
      member.openDeals += 1;
      member.pipelineValue += Number(deal.value ?? 0);
    }
  }

  for (const task of tasks) {
    const memberId = task.assigned_to;

    if (!memberId) continue;

    const member = memberStats.get(memberId);

    if (!member) continue;

    const isOpen =
      task.status !== "completed" &&
      task.status !== "cancelled";

    if (isOpen) {
      member.openTasks += 1;
    }

    const isOverdue =
      isOpen &&
      task.due_date &&
      new Date(task.due_date) < now;

    if (isOverdue) {
      member.overdueTasks += 1;
    }
  }

  for (const call of calls) {
    const memberId = call.assigned_to;

    if (!memberId) continue;

    const member = memberStats.get(memberId);

    if (!member) continue;

    if (call.status === "completed") {
      member.completedCalls += 1;
    }

    const isScheduled =
      call.status === "scheduled" &&
      call.scheduled_for &&
      new Date(call.scheduled_for) >= now;

    if (isScheduled) {
      member.scheduledCalls += 1;
    }
  }

  for (const email of emails) {
    if (email.status !== "sent") continue;

    const memberId = email.sender_id;

    if (!memberId) continue;

    const member = memberStats.get(memberId);

    if (member) {
      member.emailsSent += 1;
    }
  }

  for (const message of sms) {
    if (
      message.status !== "sent" &&
      message.status !== "delivered"
    ) {
      continue;
    }

    const memberId = message.sender_id;

    if (!memberId) continue;

    const member = memberStats.get(memberId);

    if (member) {
      member.smsSent += 1;
    }
  }

  const scopedMemberId = scope === "user" ? memberId : null;

  const scopedLeads = scopedMemberId
    ? leads.filter(
        (lead) =>
          (lead.assigned_to ?? lead.owner_id) === scopedMemberId
      )
    : leads;

  const scopedContacts = scopedMemberId
    ? contacts.filter(
        (contact) =>
          (contact.assigned_to ?? contact.owner_id) === scopedMemberId
      )
    : contacts;

  const scopedCustomers = scopedMemberId
    ? customers.filter(
        (customer) =>
          (customer.assigned_to ?? customer.owner_id) === scopedMemberId
      )
    : customers;

  const scopedDeals = scopedMemberId
    ? deals.filter(
        (deal) =>
          (deal.assigned_to ?? deal.owner_id) === scopedMemberId
      )
    : deals;

  const scopedTasks = scopedMemberId
    ? tasks.filter((task) => task.assigned_to === scopedMemberId)
    : tasks;

  const scopedCalls = scopedMemberId
    ? calls.filter((call) => call.assigned_to === scopedMemberId)
    : calls;

  const scopedEmails = scopedMemberId
    ? emails.filter((email) => email.sender_id === scopedMemberId)
    : emails;

  const scopedSms = scopedMemberId
    ? sms.filter((message) => message.sender_id === scopedMemberId)
    : sms;

  const openDeals = scopedDeals.filter(
    (deal) =>
      deal.stage !== "Closed Won" &&
      deal.stage !== "Closed Lost"
  );

  const wonDeals = scopedDeals.filter(
    (deal) => deal.stage === "Closed Won"
  );

  const openTasks = scopedTasks.filter(
    (task) =>
      task.status !== "completed" &&
      task.status !== "cancelled"
  );

  const overdueTasks = openTasks.filter(
    (task) =>
      task.due_date &&
      new Date(task.due_date) < now
  );

  const scheduledCalls = scopedCalls.filter(
    (call) =>
      call.status === "scheduled" &&
      call.scheduled_for &&
      new Date(call.scheduled_for) >= now
  );

  const kpis = {
    totalLeads: scopedLeads.length,
    totalContacts: scopedContacts.length,
    totalCustomers: scopedCustomers.length,
    totalDeals: scopedDeals.length,

    openDeals: openDeals.length,

    pipelineValue: openDeals.reduce(
      (sum, deal) => sum + Number(deal.value ?? 0),
      0
    ),

    wonRevenue: wonDeals.reduce(
      (sum, deal) => sum + Number(deal.value ?? 0),
      0
    ),

    openTasks: openTasks.length,
    overdueTasks: overdueTasks.length,
    scheduledCalls: scheduledCalls.length,
  };

  const pipelineMap = new Map<
    string,
    { count: number; value: number }
  >();

  for (const deal of scopedDeals) {
    const existing = pipelineMap.get(deal.stage) ?? {
      count: 0,
      value: 0,
    };

    existing.count += 1;
    existing.value += Number(deal.value ?? 0);

    pipelineMap.set(deal.stage, existing);
  }

  const pipelineStages = Array.from(
    pipelineMap.entries()
  ).map(([stage, metrics]) => ({
    stage,
    count: metrics.count,
    value: metrics.value,
  }));

  const leadByStatus: Record<string, number> = {};
  const leadByPriority: Record<string, number> = {};
  const leadBySource: Record<string, number> = {};

  for (const lead of scopedLeads) {
    leadByStatus[lead.status] =
      (leadByStatus[lead.status] ?? 0) + 1;

    leadByPriority[lead.priority] =
      (leadByPriority[lead.priority] ?? 0) + 1;

    const source = lead.source ?? "Unknown";

    leadBySource[source] =
      (leadBySource[source] ?? 0) + 1;
  }

  const leadOverview = {
    total: scopedLeads.length,
    byStatus: leadByStatus,
    byPriority: leadByPriority,
    bySource: leadBySource,
  };

  const customerByStatus: Record<string, number> = {};

  for (const customer of scopedCustomers) {
    customerByStatus[customer.status] =
      (customerByStatus[customer.status] ?? 0) + 1;
  }

  const customerOverview = {
    total: scopedCustomers.length,
    byStatus: customerByStatus,
  };

  const activity = {
    emailsSent: scopedEmails.filter(
      (email) => email.status === "sent"
    ).length,

    smsSent: scopedSms.filter(
      (message) =>
        message.status === "sent" ||
        message.status === "delivered"
    ).length,

    callsCompleted: scopedCalls.filter(
      (call) => call.status === "completed"
    ).length,

    tasksCompleted: scopedTasks.filter(
      (task) => task.status === "completed"
    ).length,

    tasksPending: openTasks.length,

    tasksOverdue: overdueTasks.length,
  };

  const membersWithStats = Array.from(memberStats.values());

  const lastActivityByContact = new Map<string, string>();

  for (const activityItem of contactActivities) {
    if (!activityItem.contact_id) continue;

    if (!lastActivityByContact.has(activityItem.contact_id)) {
      lastActivityByContact.set(
        activityItem.contact_id,
        activityItem.created_at
      );
    }
  }

  const priorityLeads = [...scopedLeads]
    .filter(
      (lead) =>
        lead.priority === "Highest" ||
        lead.priority === "High"
    )
    .sort((a, b) => {
      const priorityRank = {
        Highest: 0,
        High: 1,
        Low: 2,
      };

      const aPriority =
        priorityRank[a.priority as keyof typeof priorityRank] ?? 99;

      const bPriority =
        priorityRank[b.priority as keyof typeof priorityRank] ?? 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return (
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime()
      );
    })
    .slice(0, 5)
    .map((lead) => ({
      id: lead.id,
      displayId: lead.display_id,
      name:
        [lead.first_name, lead.last_name]
          .filter(Boolean)
          .join(" ") || "Unnamed Lead",
      priority: lead.priority,
      createdAt: lead.created_at,
      updatedAt: lead.updated_at,
    }));

  const priorityContacts = [...scopedContacts]
    .filter(
      (contact) =>
        contact.priority === "Highest" ||
        contact.priority === "High"
    )
    .sort((a, b) => {
      const priorityRank = {
        Highest: 0,
        High: 1,
        Low: 2,
      };

      const aPriority =
        priorityRank[a.priority as keyof typeof priorityRank] ?? 99;

      const bPriority =
        priorityRank[b.priority as keyof typeof priorityRank] ?? 99;

      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      return (
        new Date(b.updated_at).getTime() -
        new Date(a.updated_at).getTime()
      );
    })
    .slice(0, 5)
    .map((contact) => ({
      id: contact.id,
      displayId: contact.display_id,
      name:
        [contact.first_name, contact.last_name]
          .filter(Boolean)
          .join(" ") || "Unnamed Contact",
      priority: contact.priority,
      createdAt: contact.created_at,
      updatedAt: contact.updated_at,
    }));

  const openDealsForAttention = [...openDeals]
    .sort((a, b) => {
      const valueDifference =
        Number(b.value ?? 0) - Number(a.value ?? 0);

      if (valueDifference !== 0) {
        return valueDifference;
      }

      if (!a.close_date && !b.close_date) return 0;
      if (!a.close_date) return 1;
      if (!b.close_date) return -1;

      return (
        new Date(a.close_date).getTime() -
        new Date(b.close_date).getTime()
      );
    })
    .slice(0, 5);

  const openDealItems = openDealsForAttention.map((deal) => ({
    id: deal.id,
    displayId: deal.display_id,
    title: deal.title,
    stage: deal.stage,
    value: Number(deal.value ?? 0),
    closeDate: deal.close_date,
    updatedAt: deal.updated_at,
  }));

  const inactiveContacts = [...scopedContacts]
  .map((contact) => {
    const lastActivityAt =
      lastActivityByContact.get(contact.id) ?? null;

    return {
      contact,
      lastActivityAt,
    };
  })
  .filter(({ lastActivityAt }) => {
    if (!lastActivityAt) return true;

    return new Date(lastActivityAt) < inactiveThreshold;
  })
  .sort((a, b) => {
    const aTime = a.lastActivityAt
      ? new Date(a.lastActivityAt).getTime()
      : 0;

    const bTime = b.lastActivityAt
      ? new Date(b.lastActivityAt).getTime()
      : 0;

    return aTime - bTime;
  })
  .slice(0, 5)
  .map(({ contact, lastActivityAt }) => ({
    id: contact.id,
    displayId: contact.display_id,
    name:
      [contact.first_name, contact.last_name]
        .filter(Boolean)
        .join(" ") || "Unnamed Contact",
    priority: contact.priority,
    lastActivityAt,
    inactiveDays: lastActivityAt
      ? Math.floor(
          (now.getTime() - new Date(lastActivityAt).getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : Math.floor(
          (now.getTime() - new Date(contact.created_at).getTime()) /
            (1000 * 60 * 60 * 24)
        ),
  }));

  const scopedActivities =
    scope === "user"
      ? activities.filter(
          (activity) => activity.created_by === memberId
        )
      : activities;

  const recentActivity = scopedActivities
    .slice(0, 10)
    .map((activity) => {
      const member = activity.created_by
        ? dashboardMembers.find(
            (item) => item.memberId === activity.created_by
          )
        : null;

      return {
        id: activity.id,
        type: activity.type,
        action: activity.action,
        title: activity.title,
        description: activity.description ?? null,
        targetName: activity.target_name ?? null,
        createdAt: activity.created_at,
        createdBy: member
          ? {
              memberId: member.memberId,
              name: member.name,
              avatarUrl: member.avatarUrl,
            }
          : null,
      };
    });


  return {
    scope,
    role,
    kpis,
    pipeline: {
      stages: pipelineStages,
    },
    leads: leadOverview,
    customers: customerOverview,
    activity,
    attention: {
      priorityLeads,
      priorityContacts,
      openDeals: openDealItems,
      inactiveContacts,
    },
    recentActivity,
    members:
      scope === "organization"
        ? membersWithStats
        : membersWithStats.filter(
            (member) => member.memberId === memberId
          ),
  };
};