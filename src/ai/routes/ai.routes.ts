import { Router } from "express";

import {
  authenticateUser,
  requireActiveMembership,
  verifyToken,
} from "../../middleware/auth.middleware";

import { aiLimiter } from "../../middleware/rate.limit.middleware";

import {
  chatWithAI,
  confirmAIAction,
} from "../controllers/ai.controller";

const router = Router();

// router.post(
//   "/public/chat",
//   aiLimiter,
//   chatWithAIpublic
// );


router.use(verifyToken);

router.use(authenticateUser);

router.post(
  "/chat",
  aiLimiter,
  chatWithAI
);

router.post(
  "/confirmations/:confirmationId/confirm",
  confirmAIAction
);

export default router;