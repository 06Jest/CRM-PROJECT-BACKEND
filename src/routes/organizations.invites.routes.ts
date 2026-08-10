import { Router } from "express";

import {
  createOrganizationInvite,
  getInvites,
  acceptOrganizationInvite,
  revokeOrganizationInvite,
  approveJoinMember,
  rejectJoinMember,
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


router.get(
  "/",
  getInvites
);
router.patch(
  "/join/approve/:id",
  approveJoinMember
);

router.delete(
  "/join/reject/:id",
  rejectJoinMember
);

router.post(
  "/create",
  validateBody(createOrganizationInviteSchema),
  createOrganizationInvite
);

router.post(
  "/accept",
  validateBody(acceptOrganizationInviteSchema),
  acceptOrganizationInvite
);

router.delete(
  "/delete/:id",
  revokeOrganizationInvite
);

export default router;