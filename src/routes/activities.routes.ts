import { Router } from "express";

import {
  verifyToken,
  authenticateUser,
  requireActiveMembership,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  getActivities,
  getActivityByID,
  getLeadActivities,
  getContactActivities,
  getCustomerActivities,
  getActivitiesByAction,
  getActivitiesByType,
  manualAddActivity,
  updateActivity,
} from "../controllers/activities.controller";

import {
  manualAddActivitySchema,
  updateActivitySchema,
} from "../schema/activities.schema";
import { createLimiter, readLimiter, updateLimiter, } from '../middleware/rate.limit.middleware';

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);


router.get("/show-activities",readLimiter, getActivities);

router.get("/show-activity/:id",readLimiter, getActivityByID);

router.get("/show-lead-activities/:leadId",readLimiter, getLeadActivities);

router.get("/show-contact-activities/:contactId",readLimiter, getContactActivities);

router.get("/show-customer-activities/:customerId",readLimiter, getCustomerActivities);

router.get("/show-activities-action/:action",readLimiter, getActivitiesByAction);

router.get("/show-activities-type/:type",readLimiter, getActivitiesByType);

router.use(requireActiveMembership);

router.post(
  "/add-manual-activity",
  createLimiter,
  validateBody(manualAddActivitySchema),
  manualAddActivity
);

router.patch(
  "/update-activity/:id",
  updateLimiter,
  validateBody(updateActivitySchema),
  updateActivity
);

export default router;