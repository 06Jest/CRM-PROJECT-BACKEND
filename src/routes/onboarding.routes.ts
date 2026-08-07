import { Router } from "express";

import {
  verifyToken,
  authenticateUser,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  completeProfileSchema,
} from "../schema/profile.schema";

import {
  createWorkspaceSchema,
} from "../schema/organization.schema";

import {
  createSubscriptionSchema,
} from "../schema/subscription.schema";
import { completeProfileSetup } from "../controllers/profile.controller";
import { createWorkspaceController } from "../controllers/organizations.controller";
import { createFreeSubscription } from "../controllers/subscription.controller";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.post(
  "/profile",
  validateBody(completeProfileSchema),
  completeProfileSetup
);

router.post(
  "/workspace",
  validateBody(createWorkspaceSchema),
  createWorkspaceController
);

router.post(
  "/subscription",
  validateBody(createSubscriptionSchema),
  createFreeSubscription
);
export default router;