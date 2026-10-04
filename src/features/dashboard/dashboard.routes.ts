import { Router } from "express";

import {
  authenticateUser,
  verifyToken,
} from "../../middleware/auth.middleware";

import { readLimiter } from "../../middleware/rate.limit.middleware";

import { getDashboard } from "./dashboard.controller";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get(
  "/",
  readLimiter,
  getDashboard
);

export default router;