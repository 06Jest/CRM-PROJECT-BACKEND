// This is Dashboard controller
import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";

import {
  getDashboardOverviewFromDB,
  getLeadMetricsFromDB,
  getDealMetricsFromDB,
  getCustomerMetricsFromDB,
  getActivityMetricsFromDB,
  getDashboardTrendsFromDB,
  getRecentDashboardActivitiesFromDB,
  getUserPerformanceMetricsFromDB,
} from "../services/dashboard.service";

import type { TrendInterval } from "../types/dashboard";

const ALLOWED_TREND_INTERVALS: TrendInterval[] = ["day", "week", "month"];

export const getDashboardOverview = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const overview = await getDashboardOverviewFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard overview fetch successful",
      data: overview,
    });

  } catch (err) {
    next(err);
  }
};

export const getLeadMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const leadMetrics = await getLeadMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Lead metrics fetch successful",
      data: leadMetrics,
    });

  } catch (err) {
    next(err);
  }
};

export const getDealMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const dealMetrics = await getDealMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Deal metrics fetch successful",
      data: dealMetrics,
    });

  } catch (err) {
    next(err);
  }
};

export const getCustomerMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const customerMetrics = await getCustomerMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Customer metrics fetch successful",
      data: customerMetrics,
    });

  } catch (err) {
    next(err);
  }
};

export const getActivityMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const activityMetrics = await getActivityMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Activity metrics fetch successful",
      data: activityMetrics,
    });

  } catch (err) {
    next(err);
  }
};

export const getDashboardTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const intervalQuery = req.query.interval;

    const interval: TrendInterval =
      typeof intervalQuery === "string" &&
      ALLOWED_TREND_INTERVALS.includes(intervalQuery as TrendInterval)
        ? (intervalQuery as TrendInterval)
        : "day";

    const daysBackQuery = req.query.daysBack;

    const daysBack =
      daysBackQuery !== undefined
        ? Number(daysBackQuery)
        : 30;

    if (!Number.isFinite(daysBack) || daysBack <= 0) {
      throw new AppError(400, "Invalid daysBack query parameter");
    }

    const trends = await getDashboardTrendsFromDB(
      orgId,
      accessToken,
      interval,
      daysBack
    );

    return res.status(200).json({
      success: true,
      message: "Dashboard trends fetch successful",
      data: trends,
    });

  } catch (err) {
    next(err);
  }
};

export const getRecentDashboardActivities = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const limitQuery = req.query.limit;

    const limit =
      limitQuery !== undefined
        ? Number(limitQuery)
        : 10;

    if (!Number.isFinite(limit) || limit <= 0) {
      throw new AppError(400, "Invalid limit query parameter");
    }

    const activities = await getRecentDashboardActivitiesFromDB(
      orgId,
      accessToken,
      limit
    );

    return res.status(200).json({
      success: true,
      message: "Recent dashboard activities fetch successful",
      data: activities,
    });

  } catch (err) {
    next(err);
  }
};

export const getUserPerformanceMetrics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const performanceMetrics = await getUserPerformanceMetricsFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "User performance metrics fetch successful",
      data: performanceMetrics,
    });

  } catch (err) {
    next(err);
  }
};