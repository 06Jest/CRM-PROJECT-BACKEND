import { Request, Response } from 'express';
import {
  getOverviewStats,
  getActiveUsersByPeriod,
  getTopPages,
  getDeviceBreakdown,
  getDailyPageViews,
  getFeatureAdoption,
  getSystemStats,
  getSubscriptionStats,
} from '../services/analytics.service';


export const getAllAnalytics = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [
      overview,
      activeUsers,
      topPages,
      devices,
      dailyViews,
      featureAdoption,
      systemStats,
      subscriptionStats,
    ] = await Promise.all([
      getOverviewStats(),
      getActiveUsersByPeriod(),
      getTopPages(),
      getDeviceBreakdown(),
      getDailyPageViews(),
      getFeatureAdoption(),
      getSystemStats(),
      getSubscriptionStats(),
    ]);

    res.json({
      success: true,
      data: {
        overview,
        activeUsers,
        topPages,
        devices,
        dailyViews,
        featureAdoption,
        systemStats,
        subscriptionStats,
      },
    });
  } catch (err: any) {
    console.error('[ANALYTICS] Error:', err.message);
    
    res.json({
      success: true,
      data: getMockAnalytics(),
      mock: true,
    });
  }
};


export const getSystemStatsHandler = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const [systemStats, subscriptionStats] = await Promise.all([
      getSystemStats(),
      getSubscriptionStats(),
    ]);
    res.json({ success: true, data: { systemStats, subscriptionStats } });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
};


function getMockAnalytics() {
  return {
    overview: {
      pageViews: 0,
      activeUsers: 0,
      sessions: 0,
      avgSessionDuration: 0,
    },
    activeUsers: { today: 0, week: 0, month: 0 },
    topPages: [],
    devices: {},
    dailyViews: [],
    featureAdoption: {},
    systemStats: {},
    subscriptionStats: {
      totalUsers: 0, proUsers: 0, freeUsers: 0, conversionRate: 0,
    },
    note: 'GA4 not configured. Add GA4_PROPERTY_ID and credentials to .env',
  };
}