import { Router } from "express";

import {
  authenticateUser,
  requireActiveMembership,
  verifyToken,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  getAllEmails,
  getEmailByID,
  addEmailDraft,
  updateEmailDraft,
  sendEmail,
  getLeadEmailHistory,
  getContactEmailHistory,
  getCustomerEmailHistory,
  removeEmail,
} from "../controllers/email.controller";

import {
  createEmailDraftSchema,
  updateEmailDraftSchema,
} from "../schema/email.schema";

import {
  createLimiter,
  deleteLimiter,
  emailLimiter,
  readLimiter,
  updateLimiter,
} from "../middleware/rate.limit.middleware";

import { idempotencyMiddleware } from "../idempotency/idempotency.middleware";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get(
  "/show-emails",
  readLimiter,
  getAllEmails
);

router.get(
  "/show-email/:id",
  readLimiter,
  getEmailByID
);

router.get(
  "/lead/:leadId/emails",
  readLimiter,
  getLeadEmailHistory
);

router.get(
  "/contact/:contactId/emails",
  readLimiter,
  getContactEmailHistory
);

router.get(
  "/customer/:customerId/emails",
  readLimiter,
  getCustomerEmailHistory
);

router.use(requireActiveMembership);

router.post(
  "/add-email-draft",
  createLimiter,
  validateBody(createEmailDraftSchema),
  idempotencyMiddleware,
  addEmailDraft
);

router.post(
  "/send-email/:id",
  emailLimiter,
  idempotencyMiddleware,
  sendEmail
);

router.patch(
  "/update-email/:id",
  updateLimiter,
  validateBody(updateEmailDraftSchema),
  updateEmailDraft
);

router.delete(
  "/delete-email/:id",
  deleteLimiter,
  removeEmail
);

export default router;