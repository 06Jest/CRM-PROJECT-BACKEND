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


const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get("/conversations", getUserConversations);

router.get("/direct-conversation/:userId", getDirectConversation);

router.post("/direct-conversation", validateBody(createDirectConversationSchema), createDirectConversation);

router.get("/messages/:conversationId", getMessages);

router.post("/messages/:conversationId", validateBody(sendMessageSchema), sendMessage);

router.patch("/message/:id", validateBody(updateMessageSchema), editMessage);

router.patch("/conversation/:conversationId/read", markConversationAsRead);

router.delete("/message/:id", deleteMessage);



export default router;