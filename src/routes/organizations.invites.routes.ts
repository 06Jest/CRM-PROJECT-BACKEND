import { Router } from "express";

import {
  createOrganizationInvite,
  getInvites,
  acceptOrganizationInvite,
  revokeOrganizationInvite,
} from "../controllers/organization.invites.controller";

import {
  verifyToken,
  authenticateUser,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  createOrganizationInviteSchema,
  acceptOrganizationInviteSchema,
} from "../schema/orginvites.schema";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.post(
  "/",
  validateBody(createOrganizationInviteSchema),
  createOrganizationInvite
);

router.get(
  "/",
  getInvites
);

router.post(
  "/accept",
  validateBody(acceptOrganizationInviteSchema),
  acceptOrganizationInvite
);

router.delete(
  "/:id",
  revokeOrganizationInvite
);

export default router;