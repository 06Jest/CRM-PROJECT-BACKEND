import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


const getGA4Client = () =>
  new BetaAnalyticsDataClient({
    credentials: {
      client_email: process.env.GA4_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GA4_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  });

const propertyId = process.env.GA4_PROPERTY_ID || 'properties/0';


async function runReport(
  dateRange: { startDate: string; endDate: string },
  dimensions: string[],
  metrics: string[]
) {
  const client = getGA4Client();
  const [response] = await client.runReport({
    property: propertyId,
    dateRanges: [dateRange],
    dimensions: dimensions.map(name => ({ name })),
    metrics: metrics.map(name => ({ name })),
  });
  return response;
}


export const getOverviewStats = async () => {
  const response = await runReport(
    { startDate: '30daysAgo', endDate: 'today' },
    [],
    ['screenPageViews', 'activeUsers', 'sessions', 'averageSessionDuration']
  );

  const row = response.rows?.[0]?.metricValues || [];
  return {
    pageViews: parseInt(row[0]?.value || '0'),
    activeUsers: parseInt(row[1]?.value || '0'),
    sessions: parseInt(row[2]?.value || '0'),
    avgSessionDuration: Math.round(parseFloat(row[3]?.value || '0')),
  };
};


export const getActiveUsersByPeriod = async () => {
  const today = await runReport(
    { startDate: 'today', endDate: 'today' },
    [], ['activeUsers']
  );
  const week = await runReport(
    { startDate: '7daysAgo', endDate: 'today' },
    [], ['activeUsers']
  );
  const month = await runReport(
    { startDate: '30daysAgo', endDate: 'today' },
    [], ['activeUsers']
  );

  return {
    today: parseInt(today.rows?.[0]?.metricValues?.[0]?.value || '0'),
    week: parseInt(week.rows?.[0]?.metricValues?.[0]?.value || '0'),
    month: parseInt(month.rows?.[0]?.metricValues?.[0]?.value || '0'),
  };
};


export const getTopPages = async () => {
  const response = await runReport(
    { startDate: '30daysAgo', endDate: 'today' },
    ['pagePath'],
    ['screenPageViews', 'activeUsers']
  );

  return (response.rows || [])
    .slice(0, 10)
    .map(row => ({
      path: row.dimensionValues?.[0]?.value || '/',
      views: parseInt(row.metricValues?.[0]?.value || '0'),
      users: parseInt(row.metricValues?.[1]?.value || '0'),
    }))
    .sort((a, b) => b.views - a.views);
};


export const getDeviceBreakdown = async () => {
  const response = await runReport(
    { startDate: '30daysAgo', endDate: 'today' },
    ['deviceCategory'],
    ['activeUsers']
  );

  const result: Record<string, number> = {};
  (response.rows || []).forEach(row => {
    const device = row.dimensionValues?.[0]?.value || 'unknown';
    result[device] = parseInt(row.metricValues?.[0]?.value || '0');
  });
  return result;
};


export const getDailyPageViews = async () => {
  const response = await runReport(
    { startDate: '30daysAgo', endDate: 'today' },
    ['date'],
    ['screenPageViews']
  );

  return (response.rows || []).map(row => ({
    date: row.dimensionValues?.[0]?.value || '',
    views: parseInt(row.metricValues?.[0]?.value || '0'),
  }));
};


export const getFeatureAdoption = async () => {
  const response = await runReport(
    { startDate: '30daysAgo', endDate: 'today' },
    ['eventName'],
    ['eventCount']
  );

  const events: Record<string, number> = {};
  (response.rows || []).forEach(row => {
    const name = row.dimensionValues?.[0]?.value || '';
    events[name] = parseInt(row.metricValues?.[0]?.value || '0');
  });
  return events;
};

export const getSystemStats = async () => {
  const tables = ['contacts', 'leads', 'deals', 'activities', 'customers', 'messages', 'profiles'];

  const counts: Record<string, number> = {};
  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    counts[table] = count || 0;
  }
  return counts;
};


export const getSubscriptionStats = async () => {
  const { data: subs } = await supabase
    .from('subscriptions')
    .select('plan, status');

  const { count: totalUsers } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const proCount = (subs || []).filter(s => s.plan === 'pro').length;
  const freeCount = (totalUsers || 0) - proCount;

  return {
    totalUsers: totalUsers || 0,
    proUsers: proCount,
    freeUsers: freeCount,
    conversionRate: totalUsers
      ? Math.round((proCount / totalUsers) * 100)
      : 0,
  };
};
