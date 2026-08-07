import { Router } from "express";

import {
  getMembersListItem,
  updateMemberRole,
  updateMemberStatus,
  removeMember,
} from "../controllers/organization.members.controller";

import {
  verifyToken,
} from "../middleware/auth.middleware";

import {
  validateBody,
} from "../middleware/validate";

import {
  updateMemberRoleSchema,
  updateMemberStatusSchema,
} from "../schema/orgmember.schema";


const router = Router();


router.use(verifyToken);



router.get(
  "/",
  getMembersListItem
);



router.patch(
  "/:id/role",
  validateBody(updateMemberRoleSchema),
  updateMemberRole
);



router.patch(
  "/:id/status",
  validateBody(updateMemberStatusSchema),
  updateMemberStatus
);



router.delete(
  "/:id",
  removeMember
);



export default router;