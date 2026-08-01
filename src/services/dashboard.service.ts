import { createSupabaseUserClient } from '../config/supabase';
import { table } from '../config/tables';
import { AppError } from '../middleware/error.middleware';

import type {
  DashboardOverview,
  LeadMetrics,
  DealMetrics,
  CustomerMetrics,
  ActivityMetrics,
  DashboardTrends,
  ActivityItem,
  UserPerformanceMetrics,
  TrendInterval,
  CustomerWithContact
} from '../types/dashboard';

const contactsTab = table.contacts;
const leadsTab = table.leads;
const dealsTab = table.deals;
const customersTab = table.customers;
const emailsTab = table.emails;
const smsTab = table.sms;
const tasksTab = table.tasks;
const callsTab = table.calls;

export const getDashboardOverviewFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DashboardOverview> => {

  const db = createSupabaseUserClient(accessToken);

  const [
    contacts,
    leads,
    deals,
    customers,
    emails,
    sms,
    calls,
    tasks
  ] = await Promise.all([

    db
      .from(contactsTab)
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(leadsTab)
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(dealsTab)
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(customersTab)
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(emailsTab)
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(smsTab)
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('org_id', orgId),

    db
      .from(callsTab)
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(tasksTab)
      .select('*', {
        count: 'exact',
        head: true
      })
      .eq('org_id', orgId)
      .is('deleted_at', null)

  ]);

  if (
    contacts.error ||
    leads.error ||
    deals.error ||
    customers.error ||
    emails.error ||
    sms.error ||
    calls.error ||
    tasks.error
  ) {
    throw new AppError(
      500,
      contacts.error?.message ||
      leads.error?.message ||
      deals.error?.message ||
      customers.error?.message ||
      emails.error?.message ||
      sms.error?.message ||
      calls.error?.message ||
      tasks.error?.message ||
      'Failed to fetch dashboard overview.'
    );
  }

  return {
    totalContacts: contacts.count ?? 0,
    totalLeads: leads.count ?? 0,
    totalDeals: deals.count ?? 0,
    totalCustomers: customers.count ?? 0,
    totalEmails: emails.count ?? 0,
    totalSms: sms.count ?? 0,
    totalCalls: calls.count ?? 0,
    totalTasks: tasks.count ?? 0
  };
};

export const getLeadMetricsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<LeadMetrics> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(leadsTab)
    .select(`
      source,
      priority,
      status
    `)
    .eq('org_id', orgId)
    .is('deleted_at', null);

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch lead metrics: ${error.message}`
    );
  }

  let totalLeads = 0;
  let convertedLeads = 0;

  const leadsBySource: Record<string, number> = {};
  const leadsByPriority: Record<string, number> = {};
  const leadsByStatus: Record<string, number> = {};

  for (const lead of data ?? []) {

    totalLeads++;

    const source = lead.source ?? 'Unknown';
    const priority = lead.priority ?? 'Unknown';
    const status = lead.status ?? 'Unknown';

    leadsBySource[source] =
      (leadsBySource[source] ?? 0) + 1;

    leadsByPriority[priority] =
      (leadsByPriority[priority] ?? 0) + 1;

    leadsByStatus[status] =
      (leadsByStatus[status] ?? 0) + 1;

    if (status.toLowerCase() === 'qualified') {
      convertedLeads++;
    }

  }

  return {
    totalLeads,
    leadsBySource,
    leadsByPriority,
    leadsByStatus,
    conversionRate:
      totalLeads > 0
        ? Number(
            (
              (convertedLeads / totalLeads) * 100
            ).toFixed(2)
          )
        : 0
  };

};


export const getDealMetricsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DealMetrics> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(dealsTab)
    .select(`
      stage,
      value
    `)
    .eq('org_id', orgId)
    .is('deleted_at', null);

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch deal metrics: ${error.message}`
    );
  }

  let totalDeals = 0;
  let wonDeals = 0;
  let lostDeals = 0;
  let totalRevenue = 0;

  const dealsByStage: Record<string, number> = {};

  for (const deal of data ?? []) {

    totalDeals++;

    const stage = deal.stage ?? 'Unknown';
    const amount = Number(deal.value) || 0;

    dealsByStage[stage] =
      (dealsByStage[stage] ?? 0) + 1;

    if (stage.toLowerCase() === 'closed won') {
      wonDeals++;
      totalRevenue += amount;
    }

    if (stage.toLowerCase() === 'closed lost') {
      lostDeals++;
    }

  }

  const openDeals =
    totalDeals - wonDeals - lostDeals;

  const closedDeals =
    wonDeals + lostDeals;

  return {
    totalDeals,
    dealsByStage,
    wonDeals,
    lostDeals,
    openDeals,
    totalRevenue,
    averageDealSize:
      wonDeals > 0
        ? Number(
            (
              totalRevenue / wonDeals
            ).toFixed(2)
          )
        : 0,
    winRate:
      closedDeals > 0
        ? Number(
            (
              (wonDeals / closedDeals) * 100
            ).toFixed(2)
          )
        : 0
  };

};


export const getCustomerMetricsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<CustomerMetrics> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(customersTab)
    .select(`
      id,
      status,
      created_at
    `)
    .eq('org_id', orgId)
    .is('deleted_at', null);

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch customer metrics: ${error.message}`
    );
  }

  let totalCustomers = 0;

  let activeCustomers = 0;
  let churnedCustomers = 0;

  const customersByStatus: Record<string, number> = {};
  const customerGrowth: Record<string, number> = {};

  for (const customer of data ?? []) {

    totalCustomers++;

    const status = customer.status ?? 'Unknown';

    customersByStatus[status] =
      (customersByStatus[status] ?? 0) + 1;

    if (status === 'Active') {
      activeCustomers++;
    }

    if (status === 'Churned') {
      churnedCustomers++;
    }

    if (customer.created_at) {

      const month = customer.created_at.slice(0, 7);

      customerGrowth[month] =
        (customerGrowth[month] ?? 0) + 1;

    }

  }

  return {
    totalCustomers,
    customersByStatus,
    activeCustomers,
    churnedCustomers,
    customerGrowth
  };

};

export const getActivityMetricsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<ActivityMetrics> => {

  const db = createSupabaseUserClient(accessToken);

  const [
    emails,
    sms,
    calls,
    tasks
  ] = await Promise.all([

    db
      .from(emailsTab)
      .select("*", {
        count: "exact",
        head: true
      })
      .eq('org_id', orgId)
      .eq('status', 'sent')
      .is('deleted_at', null),

    db
      .from(smsTab)
      .select("*", {
        count: "exact",
        head: true
      })
      .eq('org_id', orgId)
      .eq('status', 'sent'),

    db
      .from(callsTab)
      .select("*", {
        count: "exact",
        head: true
      })
      .eq('org_id', orgId)
      .eq('status', 'completed')
      .is('deleted_at', null),

    db
      .from(tasksTab)
      .select(`
        id,
        status,
        due_date
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)

  ]);

  if (
    emails.error ||
    sms.error ||
    calls.error ||
    tasks.error
  ) {
    throw new AppError(
      500,
      emails.error?.message ||
      sms.error?.message ||
      calls.error?.message ||
      tasks.error?.message ||
      'Failed to fetch activity metrics.'
    );
  }

  let tasksCompleted = 0;
  let tasksPending = 0;
  let tasksOverdue = 0;

  const now = new Date();

  for (const task of tasks.data ?? []) {

    if (task.status === 'completed') {
      tasksCompleted++;
    }

    if (task.status === 'in_progress') {
      tasksPending++;
    }
    if (task.status === 'todo') {
      tasksPending++;
    }

    if (
      task.status !== 'completed' &&
      task.due_date &&
      new Date(task.due_date) < now
    ) {
      tasksOverdue++;
    }

  }

  return {
    emailsSent: emails.data?.length ?? 0,
    smsSent: sms.data?.length ?? 0,
    callsCompleted: calls.data?.length ?? 0,
    tasksCompleted,
    tasksPending,
    tasksOverdue
  };

};

export const getDashboardTrendsFromDB = async (
  orgId: string,
  accessToken: string,
  interval: TrendInterval = 'day',
  daysBack = 30
): Promise<DashboardTrends> => {

  const db = createSupabaseUserClient(accessToken);

  const startDate = new Date();

  startDate.setDate(startDate.getDate() - daysBack);

  const startDateISO = startDate.toISOString();

  const [
    leads,
    deals,
    customers
  ] = await Promise.all([

    db
      .from(leadsTab)
      .select(`
        created_at
      `)
      .eq('org_id', orgId)
      .gte('created_at', startDateISO)
      .is('deleted_at', null),

    db
      .from(dealsTab)
      .select(`
        created_at,
        value,
        stage
      `)
      .eq('org_id', orgId)
      .gte('created_at', startDateISO)
      .is('deleted_at', null),

    db
      .from(customersTab)
      .select(`
        created_at
      `)
      .eq('org_id', orgId)
      .gte('created_at', startDateISO)
      .is('deleted_at', null)

  ]);

  if (
    leads.error ||
    deals.error ||
    customers.error
  ) {
    throw new AppError(
      500,
      leads.error?.message ||
      deals.error?.message ||
      customers.error?.message ||
      'Failed to fetch dashboard trends.'
    );
  }

  const leadsCreated: Record<string, number> = {};

  const dealsCreated: Record<string, number> = {};

  const revenueOverTime: Record<string, number> = {};

  const customerGrowth: Record<string, number> = {};

  const getBucket = (
    date: string
  ): string => {

    const d = new Date(date);

    if (interval === 'day') {
      return d.toISOString().slice(0, 10);
    }

    if (interval === 'month') {
      return d.toISOString().slice(0, 7);
    }

    const firstDay = new Date(d);

    const day = firstDay.getUTCDay();

    firstDay.setUTCDate(
      firstDay.getUTCDate() - day
    );

    return firstDay
      .toISOString()
      .slice(0, 10);

  };

  for (const lead of leads.data ?? []) {

    const bucket = getBucket(
      lead.created_at
    );

    leadsCreated[bucket] =
      (leadsCreated[bucket] ?? 0) + 1;

  }

  for (const deal of deals.data ?? []) {

    const bucket = getBucket(
      deal.created_at
    );

    dealsCreated[bucket] =
      (dealsCreated[bucket] ?? 0) + 1;

    if (
      deal.stage?.toLowerCase() === 'closed won'
    ) {

      revenueOverTime[bucket] =
        (revenueOverTime[bucket] ?? 0) +
        (Number(deal.value) || 0);

    }

  }

  for (const customer of customers.data ?? []) {

    const bucket = getBucket(
      customer.created_at
    );

    customerGrowth[bucket] =
      (customerGrowth[bucket] ?? 0) + 1;

  }

  return {
    interval,
    startDate: startDateISO,
    leadsCreated,
    dealsCreated,
    revenueOverTime,
    customerGrowth
  };

};

export const getRecentDashboardActivitiesFromDB = async (
  orgId: string,
  accessToken: string,
  limit = 10
): Promise<ActivityItem[]> => {

  const db = createSupabaseUserClient(accessToken);

  const [
    leads,
    deals,
    customers,
    emails,
    sms,
    calls,
    tasks
  ] = await Promise.all([

    db
      .from(leadsTab)
      .select(`
        id,
        first_name,
        last_name,
        status,
        created_at
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false
      })
      .limit(limit),

    db
      .from(dealsTab)
      .select(`
        id,
        title,
        stage,
        created_at
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false
      })
      .limit(limit),

    db
      .from(customersTab)
      .select(`
        id,
        status,
        created_at,
        contact:contacts!fk_customer_contact!inner(
          id,
          first_name,
          last_name
        )
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false
      })
      .limit(limit),

    db
      .from(emailsTab)
      .select(`
        id,
        subject,
        status,
        created_at
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false
      })
      .limit(limit),

    db
      .from(smsTab)
      .select(`
        id,
        content,
        status,
        created_at
      `)
      .eq('org_id', orgId)
      .order('created_at', {
        ascending: false
      })
      .limit(limit),

    db
      .from(callsTab)
      .select(`
        id,
        subject,
        status,
        created_at
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false
      })
      .limit(limit),

    db
      .from(tasksTab)
      .select(`
        id,
        title,
        status,
        created_at
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('created_at', {
        ascending: false
      })
      .limit(limit)

  ]);

  if (
    leads.error ||
    deals.error ||
    customers.error ||
    emails.error ||
    sms.error ||
    calls.error ||
    tasks.error
  ) {
    throw new AppError(
      500,
      leads.error?.message ||
      deals.error?.message ||
      customers.error?.message ||
      emails.error?.message ||
      sms.error?.message ||
      calls.error?.message ||
      tasks.error?.message ||
      'Failed to fetch recent dashboard activities.'
    );
  }

  const activities: ActivityItem[] = [];

  for (const lead of leads.data ?? []) {

    activities.push({
      id: lead.id,
      type: 'lead',
      title: (lead.first_name && lead.last_name) ?? 'Lead',
      description: lead.status,
      createdAt: lead.created_at
    });

  }

  for (const deal of deals.data ?? []) {

    activities.push({
      id: deal.id,
      type: 'deal',
      title: deal.title ?? 'Deal',
      description: deal.stage,
      createdAt: deal.created_at
    });

  }

  for (const customer of customers.data ?? []) {
    const contact = customer.contact?.[0];

    activities.push({
      id: customer.id,
      type: "customer",
      title:
        `${contact?.first_name ?? ""} ${contact?.last_name ?? ""}`.trim()
        || "Customer",
      description: customer.status,
      createdAt: customer.created_at,
    });
  }

  for (const email of emails.data ?? []) {

    activities.push({
      id: email.id,
      type: 'email',
      title: email.subject ?? 'Email',
      description: email.status,
      createdAt: email.created_at
    });

  }

  for (const text of sms.data ?? []) {

    activities.push({
      id: text.id,
      type: 'sms',
      title: text.content ?? 'SMS',
      description: text.status,
      createdAt: text.created_at
    });

  }

  for (const call of calls.data ?? []) {

    activities.push({
      id: call.id,
      type: 'call',
      title: call.subject ?? 'Call',
      description: call.status,
      createdAt: call.created_at
    });

  }

  for (const task of tasks.data ?? []) {

    activities.push({
      id: task.id,
      type: 'task',
      title: task.title ?? 'Task',
      description: task.status,
      createdAt: task.created_at
    });

  }

  activities.sort((a, b) =>
    new Date(b.createdAt).getTime() -
    new Date(a.createdAt).getTime()
  );

  return activities.slice(0, limit);

};

export const getUserPerformanceMetricsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<UserPerformanceMetrics> => {

  const db = createSupabaseUserClient(accessToken);

  const [
    leads,
    deals,
    tasks,
    calls
  ] = await Promise.all([

    db
      .from(leadsTab)
      .select(`
        owner_id
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(dealsTab)
      .select(`
        owner_id,
        stage
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(tasksTab)
      .select(`
        assigned_to,
        status
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null),

    db
      .from(callsTab)
      .select(`
        assigned_to,
        status
      `)
      .eq('org_id', orgId)
      .is('deleted_at', null)

  ]);

  if (
    leads.error ||
    deals.error ||
    tasks.error ||
    calls.error
  ) {
    throw new AppError(
      500,
      leads.error?.message ||
      deals.error?.message ||
      tasks.error?.message ||
      calls.error?.message ||
      'Failed to fetch user performance metrics.'
    );
  }

  const leadsPerUser: Record<string, number> = {};

  const dealsClosedPerUser: Record<string, number> = {};

  const tasksCompletedPerUser: Record<string, number> = {};

  const callsCompletedPerUser: Record<string, number> = {};

  for (const lead of leads.data ?? []) {

    const user =
      lead.owner_id ?? 'Unassigned';

    leadsPerUser[user] =
      (leadsPerUser[user] ?? 0) + 1;

  }

  for (const deal of deals.data ?? []) {

    if (
      deal.stage?.toLowerCase() !== 'closed won'
    ) {
      continue;
    }

    const user =
      deal.owner_id ?? 'Unassigned';

    dealsClosedPerUser[user] =
      (dealsClosedPerUser[user] ?? 0) + 1;

  }

  for (const task of tasks.data ?? []) {

    if (
      task.status?.toLowerCase() !== 'completed'
    ) {
      continue;
    }

    const user =
      task.assigned_to ?? 'Unassigned';

    tasksCompletedPerUser[user] =
      (tasksCompletedPerUser[user] ?? 0) + 1;

  }

  for (const call of calls.data ?? []) {

    if (
      call.status?.toLowerCase() !== 'completed'
    ) {
      continue;
    }

    const user =
      call.assigned_to ?? 'Unassigned';

    callsCompletedPerUser[user] =
      (callsCompletedPerUser[user] ?? 0) + 1;

  }

  return {
    leadsPerUser,
    dealsClosedPerUser,
    tasksCompletedPerUser,
    callsCompletedPerUser
  };

};