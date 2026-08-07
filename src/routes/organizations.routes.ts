import { Router } from "express";

import {
  createWorkspaceController,
  renameWorkspaceController,
} from "../controllers/organizations.controller";

import {
  verifyToken,
  authenticateUser,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  createWorkspaceSchema,
  renameWorkspaceSchema,
} from "../schema/organization.schema";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.post(
  "/",
  validateBody(createWorkspaceSchema),
  createWorkspaceController
);

router.patch(
  "/name",
  validateBody(renameWorkspaceSchema),
  renameWorkspaceController
);

export default router;