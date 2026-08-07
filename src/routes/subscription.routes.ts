import { Router } from "express";

import {
  createFreeSubscription,
  getSubscription,
  updateSubscriptionPlan,
  updateSubscriptionStatus,
} from "../controllers/subscription.controller";

import {
  verifyToken,
  authenticateUser,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  createSubscriptionSchema,
  updateSubscriptionPlanSchema,
  updateSubscriptionStatusSchema,
} from "../schema/subscription.schema";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.post(
  "/",
  validateBody(createSubscriptionSchema),
  createFreeSubscription
);

router.get(
  "/",
  getSubscription
);

router.patch(
  "/plan",
  validateBody(updateSubscriptionPlanSchema),
  updateSubscriptionPlan
);

router.patch(
  "/status",
  validateBody(updateSubscriptionStatusSchema),
  updateSubscriptionStatus
);

export default router;