import { Router } from "express";

import {
  createWorkspaceController,
  getWorkspaceData,
  renameWorkspaceController,
  updateWorkspaceDetailsController,
} from "./organization.controller";

import {
  verifyToken,
  authenticateUser,
  requireActiveMembership,
} from "../../middleware/auth.middleware";

import { validateBody } from "../../middleware/validate";

import {
  renameWorkspaceSchema,
  updateWorkspaceDetailsSchema,
} from "./organization.schema";

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