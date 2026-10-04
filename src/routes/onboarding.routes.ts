import { Router } from "express";

import {
  verifyToken,
  authenticateUser,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  completeProfileSchema,
} from "../features/profiles/profiles.schema";

import {
  createWorkspaceSchema,
} from "../features/organizations/organization.schema";

import {
  createSubscriptionSchema,
} from "../schema/subscription.schema";
import { completeProfileSetup } from "../features/profiles/profiles.controller";
import { createWorkspaceController, joinOrganization } from "../features/organizations/organization.controller";
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
  "/workspace/join/:code",
  joinOrganization
);

router.post(
  "/subscription",
  validateBody(createSubscriptionSchema),
  createFreeSubscription
);
export default router;