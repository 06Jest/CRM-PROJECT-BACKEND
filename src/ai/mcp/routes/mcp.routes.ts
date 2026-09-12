import { Router } from "express";

import {
  verifyToken,
  authenticateUser,
  requireActiveMembership,
} from "../../../middleware/auth.middleware";

import {
  handleMcpRequest,
} from "../controllers/mcp.controller";

const router = Router();

router.post(
  "/",
  verifyToken,
  authenticateUser,
  requireActiveMembership,
  handleMcpRequest
);

export default router;