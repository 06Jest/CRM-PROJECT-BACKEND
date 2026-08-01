import { Router } from "express";

import {
  authenticateUser,
  verifyToken,
} from "../middleware/auth.middleware";

import {
  readLimiter,
} from "../middleware/rate.limit.middleware";

import {
  getDashboardOverview,
  getLeadMetrics,
  getDealMetrics,
  getCustomerMetrics,
  getActivityMetrics,
  getDashboardTrends,
  getRecentDashboardActivities,
  getUserPerformanceMetrics,
} from "../controllers/dashboard.controller";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get(
  "/overview",
  readLimiter,
  getDashboardOverview
);

router.get(
  "/lead-metrics",
  readLimiter,
  getLeadMetrics
);

router.get(
  "/deal-metrics",
  readLimiter,
  getDealMetrics
);

router.get(
  "/customer-metrics",
  readLimiter,
  getCustomerMetrics
);

router.get(
  "/activity-metrics",
  readLimiter,
  getActivityMetrics
);

router.get(
  "/trends",
  readLimiter,
  getDashboardTrends
);

router.get(
  "/recent-activities",
  readLimiter,
  getRecentDashboardActivities
);

router.get(
  "/user-performance",
  readLimiter,
  getUserPerformanceMetrics
);

export default router;