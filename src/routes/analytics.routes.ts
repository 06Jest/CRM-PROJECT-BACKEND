import { Router } from "express";
import { getAnalytics } from "../controllers/analytics.controller";
import { verifyToken } from "../middleware/auth.middleware";
import { authenticateUser } from "../middleware/auth.middleware";
import { readLimiter } from "../middleware/rate.limit.middleware";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get("/", readLimiter, getAnalytics);

export default router;