import { Router } from "express";

import {
  signUp,
  signIn,
  refreshToken,
  getCurrentUser,
  changePassword,
  signOut,
  oauthLogin,
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

router.post("/oauth", oauthLogin);

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

router.get(
  "/me",
  getCurrentUser
);

router.use(authenticateUser);

router.get("/realtime-token", (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      message: "Missing authorization token",
    });
  }

  return res.json({ token });
});

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