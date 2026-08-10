import { Router } from "express";

import { verifyToken } from "../middleware/auth.middleware";

import {
  completeProfileSetup,
  getProfile,
  updateProfile,
  updateProfileAvatar,
  updateProfileStatus,
} from "../controllers/profile.controller";

import { validateBody } from "../middleware/validate";

import {
  completeProfileSchema,
  updateProfileSchema,
  updateProfileAvatarSchema,
  updateProfileStatusSchema,
} from "../schema/profile.schema";


const router = Router();


router.use(verifyToken);

router.get(
  "/me",
  getProfile
);


router.patch(
  "/setup",
  validateBody(completeProfileSchema),
  completeProfileSetup
);

router.patch(
  "/me/update",
  validateBody(updateProfileSchema),
  updateProfile
);


router.patch(
  "/me/avatar",
  validateBody(updateProfileAvatarSchema),
  updateProfileAvatar
);


router.patch(
  "/me/status",
  validateBody(updateProfileStatusSchema),
  updateProfileStatus
);


export default router;