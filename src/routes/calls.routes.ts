import { Router } from "express";

import {
  authenticateUser,
  requireActiveMembership,
  verifyToken,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  getCalls,
  getCallByID,
  getLeadCalls,
  getContactCalls,
  addCall,
  updateCall,
  startCall,
  endCall,
  cancelCall,
  deleteCall,
} from "../controllers/call.controller";

import {
  addCallSchema,
  updateCallSchema,
  endCallSchema,
} from "../schema/calls.schema";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);


router.get("/show-calls", getCalls);

router.get("/show-call/:id", getCallByID);

router.get("/show-lead-calls/:leadId", getLeadCalls);

router.get("/show-contact-calls/:contactId", getContactCalls);

router.use(requireActiveMembership);

router.post("/add-call", validateBody(addCallSchema), addCall);

router.patch("/update-call/:id", validateBody(updateCallSchema), updateCall);

router.patch("/start-call/:id", startCall);

router.patch("/end-call/:id", validateBody(endCallSchema), endCall);

router.patch("/cancel-call/:id", cancelCall);

router.delete("/delete-call/:id", deleteCall);

export default router;  