import { Router } from "express";

import {
  getSms,
  getSmsByID,
  getLeadSms,
  getContactSms,
  getSmsByStatus,
  addSms,
  updateSmsStatus,
} from "../controllers/sms.controller";

import { validateBody } from "../middleware/validate";

import {
  addSmsSchema,
  updateSmsStatusSchema,
} from "../schema/sms.schema";
import { authenticateUser, verifyToken } from "../middleware/auth.middleware";
import { readLimiter, smsLimiter, updateLimiter } from '../middleware/rate.limit.middleware';
const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get("/",readLimiter, getSms);

router.get("/:id",readLimiter, getSmsByID);

router.get("/lead/:leadId",readLimiter, getLeadSms);

router.get("/contact/:contactId",readLimiter, getContactSms);

router.get("/status/:status",readLimiter, getSmsByStatus);

router.post("/",smsLimiter, validateBody(addSmsSchema), addSms);

router.patch("/:id/status", updateLimiter, validateBody(updateSmsStatusSchema), updateSmsStatus);

export default router;