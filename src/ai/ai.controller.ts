import {
  Request,
  Response,
  NextFunction,
} from "express";

import { aiRequestSchema } from "./validation/ai.validation";
import { aiOrchestrator } from "./ai-orchestrator";
import { AppError } from "../middleware/error.middleware";
import { AIConversationService } from "./services/ai-conversation.service";

export async function chatWithAI(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input =
      aiRequestSchema.parse(req.body);

    const profileId = req.user?.sub;
    const role = req.user?.role;
    const accessToken =
      req.cookies.accessToken;

    if (
      !profileId ||
      !role ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (input.orgId) {
      const currentOrgId = req.user?.org_id;

      if (!currentOrgId) {
        throw new AppError(
          403,
          "Organization context is not available"
        );
      }

      if (input.orgId !== currentOrgId) {
        throw new AppError(
          403,
          "You cannot use this organization context"
        );
      }
    }

    const conversationService =
      new AIConversationService(
        accessToken
      );

    let conversation;

    /*
     * Create a new conversation
     */
    if (!input.conversationId) {
      conversation =
        await conversationService.createConversation({
          profileId,
          orgId: input.orgId,
          agentId: input.agentId,
        });
    }

    /*
     * Load an existing conversation
     */
    else {
      conversation =
        await conversationService.getConversation(
          input.conversationId
        );

      if (
        conversation.profile_id !==
        profileId
      ) {
        throw new AppError(
          403,
          "You cannot access this conversation"
        );
      }

      if (conversation.org_id) {
        const currentOrgId =
          req.user?.org_id;

        if (
          !currentOrgId ||
          conversation.org_id !== currentOrgId
        ) {
          throw new AppError(
            403,
            "You cannot access this organization conversation"
          );
        }
      }
    }

    const conversationId =
      conversation.id;

    const history =
      await conversationService.getMessageHistory(
        conversationId
      );

    await conversationService.createMessage({
      conversationId,
      role: "user",
      content: input.message,
    });

    const response =
      await aiOrchestrator.run({
        agentId: conversation.agent_id,
        message: input.message,
        conversationId,
        history,
        context: {
          profileId,
          ...(conversation.org_id
            ? {
                orgId:
                  conversation.org_id,
              }
            : {}),
          role,
        },
      });

    await conversationService.createMessage({
      conversationId,
      role: "assistant",
      content: response.message,
    });

    return res.status(200).json({
      message: response.message,
      conversationId,
    });
  } catch (error) {
    next(error);
  }
}