import { Router } from "express";

import {
  signUp,
  signIn,
  refreshToken,
  getCurrentUser,
  changePassword,
  signOut,
} from "../controllers/auth.controller";

import {
  verifyToken,
  authenticateUser,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  signUpSchema,
  signInSchema,
  changePasswordSchema,
} from "../schema/auth.schema";

import {
  loginLimiter,
  refreshLimiter,
} from "../middleware/rate.limit.middleware";

const router = Router();

router.post(
  "/signup",
  loginLimiter,
  validateBody(signUpSchema),
  signUp
);

router.post(
  "/signin",
  loginLimiter,
  validateBody(signInSchema),
  signIn
);

router.patch(
  "/refresh",
  refreshLimiter,
  refreshToken
);

router.use(verifyToken);
router.use(authenticateUser);

router.get(
  "/me",
  getCurrentUser
);

router.patch(
  "/me/change-password",
  validateBody(changePasswordSchema),
  changePassword
);

router.delete(
  "/signout",
  signOut
);

export default router;