import {
  Request,
  Response,
  NextFunction,
} from "express";

import { aiRequestSchema } from "../validation/ai.validation";
import { aiOrchestrator } from "../orchestrator/ai-orchestrator";
import { AppError } from "../../middleware/error.middleware";
import { AIConversationService } from "../services/ai-conversation.service";
import { AIAgentService } from "../services/ai-agent.service";
import { AIConfirmationExecutionService } from "../services/ai-confirmation-execution.service";

export async function chatWithAI(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input =
      aiRequestSchema.parse(req.body);

    const profileId = req.user?.sub;
    const role = req.user?.user_metadata?.role;
    const memberId = req.user?.member_id;
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

    const agentService =
      new AIAgentService(
        accessToken
      );

    if (input.orgId) {
      const currentOrgId =
        req.user?.org_id;

      if (!currentOrgId) {
        throw new AppError(
          403,
          "Organization context is not available"
        );
      }

      if (
        input.orgId !== currentOrgId
      ) {
        throw new AppError(
          403,
          "You cannot use this organization context"
        );
      }
    }

    const agent =
      await agentService.getAuthorizedAgent({
        agentId: input.agentId,
        profileId,
        orgId: input.orgId,
      });

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
          orgId:
            agent.scope === "organization"
              ? input.orgId
              : undefined,
          agentId: agent.id,
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
        conversation.agent_id !==
        input.agentId
      ) {
        throw new AppError(
          400,
          "The conversation does not belong to the requested AI agent"
        );
      }

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

      await agentService.getAuthorizedAgent({
        agentId: conversation.agent_id,
        profileId,
        orgId: conversation.org_id ?? undefined,
      });
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
          memberId: memberId ?? undefined,
          role,
          accessToken,
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

export async function confirmAIAction(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { confirmationId } = req.params;
    const profileId = req.user?.sub;
    const role = req.user?.user_metadata?.role;
    const memberId = req.user?.member_id;
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

    if (
      !confirmationId ||
      Array.isArray(confirmationId)
    ) {
      throw new AppError(
        400,
        "Invalid confirmation ID"
      );
    }

    const executionService =
      new AIConfirmationExecutionService();

    const result =
      await executionService.execute(
        confirmationId,
        {
          profileId,
          ...(req.user?.org_id
            ? {
                orgId:
                  req.user.org_id,
              }
            : {}),
          ...(memberId
            ? { memberId }
            : {}),
          role,
          accessToken,
        }
      );

    return res.status(200).json({
      success: true,
      result,
    });
  } catch (error) {
    next(error);
  }
}