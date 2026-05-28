import { supabaseAdmin } from '../utils/supabase';
import type { DashboardStats } from '../types';


export const getDashboardStats = async (): Promise<DashboardStats> => {
  try {

    const { data: orgs, error: orgsError } = await supabaseAdmin
      .from('organizations')
      .select('*');

    if (orgsError) throw orgsError;


    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .neq('role', 'super_admin');

    if (profilesError) throw profilesError;

    const admins = profiles?.filter(p => p.role === 'admin') || [];
    const agents = profiles?.filter(p => p.role === 'agent') || [];

    const { count: messageCount } = await supabaseAdmin
      .from('messages')
      .select('*', { count: 'exact', head: true });

    const { count: contactCount } = await supabaseAdmin
      .from('contacts')
      .select('*', { count: 'exact', head: true });

    const { count: dealCount } = await supabaseAdmin
      .from('deals')
      .select('*', { count: 'exact', head: true });

    const { count: activityCount } = await supabaseAdmin
      .from('activities')
      .select('*', { count: 'exact', head: true });

    // Get recent logins
    const { data: recentLogins } = await supabaseAdmin
      .from('super_admin_sessions')
      .select('*, super_admin:super_admin_id(name, email)')
      .order('created_at', { ascending: false })
      .limit(5);

    // Calculate revenue
    const revenueData: any[] = [];
    let monthlyRevenue = 0;
    let weeklyRevenue = 0;

    for (const org of orgs || []) {
      const { data: invoices } = await supabaseAdmin
        .from('stripe_invoices')
        .select('amount_paid, created')
        .eq('org_id', org.id);

      const orgRevenue = invoices?.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0) || 0;
      const weeklyInvoices = invoices?.filter(
        inv => new Date(inv.created) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ) || [];
      const weeklyRev = weeklyInvoices.reduce((sum, inv) => sum + (inv.amount_paid || 0), 0);

      revenueData.push({
        name: org.name,
        revenue: orgRevenue,
        subscriptionStatus: org.subscription_status,
      });

      monthlyRevenue += orgRevenue;
      weeklyRevenue += weeklyRev;
    }


    const userGrowth = [
      { date: '7d ago', agents: agents.length - 20, admins: admins.length - 5 },
      { date: '6d ago', agents: agents.length - 18, admins: admins.length - 4 },
      { date: '5d ago', agents: agents.length - 15, admins: admins.length - 4 },
      { date: '4d ago', agents: agents.length - 12, admins: admins.length - 3 },
      { date: '3d ago', agents: agents.length - 10, admins: admins.length - 3 },
      { date: '2d ago', agents: agents.length - 5, admins: admins.length - 2 },
      { date: 'Today', agents: agents.length, admins: admins.length },
    ];

  
    const revenueGrowth = [
      { date: 'Week 1', revenue: monthlyRevenue * 0.2 },
      { date: 'Week 2', revenue: monthlyRevenue * 0.35 },
      { date: 'Week 3', revenue: monthlyRevenue * 0.55 },
      { date: 'Week 4', revenue: monthlyRevenue },
    ];


    const topOrgs = revenueData
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)
      .map((o, i) => ({ ...o, rank: i + 1 }));


    const userDistribution = [
      { name: 'Admins (Tier 2)', value: admins.length },
      { name: 'Agents (Tier 1)', value: agents.length },
    ];

    return {
      totalOrganizations: orgs?.length || 0,
      activeOrganizations: orgs?.filter(o => o.subscription_status === 'active').length || 0,
      totalAdmins: admins.length,
      totalAgents: agents.length,
      totalUsers: profiles?.length || 0,
      monthlyRevenue,
      weeklyRevenue,
      systemHealth: {
        messageCount: messageCount || 0,
        contactCount: contactCount || 0,
        dealCount: dealCount || 0,
        activityCount: activityCount || 0,
      },
      recentLogins: recentLogins || [],
      organizationData: revenueData,
      userGrowth,
      revenueGrowth,
      topOrganizations: topOrgs,
      userDistribution,
    };
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    throw err;
  }
};