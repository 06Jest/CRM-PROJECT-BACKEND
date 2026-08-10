import { Router } from "express";

import {
  createWorkspaceController,
  getWorkspaceData,
  renameWorkspaceController,
  updateWorkspaceDetailsController,
} from "../controllers/organizations.controller";

import {
  verifyToken,
  authenticateUser,
  requireActiveMembership,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  renameWorkspaceSchema,
  updateWorkspaceDetailsSchema,
} from "../schema/organization.schema";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);


router.get(
  "/",
  getWorkspaceData
);

router.use(requireActiveMembership);

router.patch(
  "/rename",
  validateBody(renameWorkspaceSchema),
  renameWorkspaceController
);

router.patch(
  "/details",
  validateBody(updateWorkspaceDetailsSchema),
  updateWorkspaceDetailsController
);

export default router;