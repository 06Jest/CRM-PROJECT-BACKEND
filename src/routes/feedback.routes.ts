import { Router } from "express";

import { validateBody } from "../middleware/validate";
import { createFeedbackSchema } from "../schema/feedback.schema";
import { createFeedback } from "../controllers/feedback.controller";

const router = Router();

router.post(
  "/",
  validateBody(createFeedbackSchema),
  createFeedback
);

export default router;