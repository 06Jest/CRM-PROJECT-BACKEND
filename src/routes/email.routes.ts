import { Router } from "express";

import {
  authenticateUser,
  verifyToken,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  getAllEmails,
  getEmailByID,
  addEmailDraft,
  updateEmailDraft,
  sendEmailController,
  getLeadEmailHistory,
  getContactEmailHistory,
  getCustomerEmailHistory,
  removeEmail,
} from "../controllers/email.controller";

import {
  createEmailDraftSchema,
  updateEmailDraftSchema,
} from "../schema/email.schema";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get("/show-emails", getAllEmails);

router.get("/show-email/:id", getEmailByID);

router.post("/add-email-draft", validateBody(createEmailDraftSchema), addEmailDraft);

router.patch("/update-email/:id", validateBody(updateEmailDraftSchema), updateEmailDraft);

router.post("/send-email/:id", sendEmailController);

router.get("/lead/:leadId/emails", getLeadEmailHistory);

router.get("/contact/:contactId/emails", getContactEmailHistory);

router.get("/customer/:customerId/emails", getCustomerEmailHistory);

router.delete("/delete-email/:id", removeEmail);

export default router;