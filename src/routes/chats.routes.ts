import { Router } from "express";

import {
  authenticateUser,
  verifyToken,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  getUserConversations,
  getDirectConversation,
  createDirectConversation,
  getMessages,
  sendMessage,
  editMessage,
  deleteMessage,
  markConversationAsRead,
} from "../controllers/chat.controller";

import {
  createDirectConversationSchema,
  sendMessageSchema,
  updateMessageSchema,
} from "../schema/chat.schema";
import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';


const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get("/conversations",readLimiter, getUserConversations);
router.get("/direct-conversation/:memberId",readLimiter, getDirectConversation);
router.get("/messages/:conversationId",readLimiter, getMessages);

router.post("/direct-conversation", createLimiter, validateBody(createDirectConversationSchema), createDirectConversation);
router.post("/messages/:conversationId", createLimiter, validateBody(sendMessageSchema), sendMessage);

router.patch("/message/:id", updateLimiter, validateBody(updateMessageSchema), editMessage);
router.patch("/conversation/:conversationId/read", updateLimiter, markConversationAsRead);

router.delete("/message/:id",deleteLimiter, deleteMessage);


export default router;