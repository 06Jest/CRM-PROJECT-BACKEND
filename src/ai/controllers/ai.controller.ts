import {
  Request,
  Response,
  NextFunction,
} from "express";

import { aiRequestSchema, publicAIRequestSchema } from "../validation/ai.validation";
import { aiOrchestrator } from "../orchestrator/ai-orchestrator";
import { AppError } from "../../middleware/error.middleware";
import { AIConversationService } from "../services/ai-conversation.service";
import { AIAgentService } from "../services/ai-agent.service";
import { AIConfirmationExecutionService } from "../services/ai-confirmation-execution.service";
import { AIQuotaService } from "../services/ai-quota.service";


export async function chatWithAIPublic(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = publicAIRequestSchema.parse(req.body);

    const response = await aiOrchestrator.run({
      agentId: "crm-assistant",
      message: input.message,
      conversationId: input.conversationId,
      history: [],
      context: {
        // No profileId
        // No orgId
        // No memberId
        // No accessToken
        isPublic: true,
      },
    });

    return res.status(200).json({
      message: response.message,
      sources: response.sources,
      citations: response.citations,
    });
  } catch (error) {
    next(error);
  }
}

export async function chatWithAI(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const input = aiRequestSchema.parse(req.body);

    const profileId = req.user?.sub;
    const role = req.user?.user_metadata?.role;
    const memberId = req.user?.member_id;
    const orgId = req.user?.org_id ?? undefined;
    const accessToken = req.cookies.accessToken;

    if (!profileId || !role || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const quotaService = new AIQuotaService();
    const agentService = new AIAgentService(accessToken);
    const conversationService =
      new AIConversationService(accessToken);

    let conversation;



    if (!input.conversationId) {
      const agent = await agentService.getAuthorizedAgent({
        agentId: input.agentId,
        profileId,
        orgId,
      });

      conversation =
        await conversationService.createConversation({
          profileId,
          orgId,
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

      if (
        conversation.org_id &&
        conversation.org_id !== orgId
      ) {
        throw new AppError(
          403,
          "You cannot access this organization conversation"
        );
      }

      /*
       * Recheck whether the authenticated user
       * is authorized to use this conversation's agent.
       */
      await agentService.getAuthorizedAgent({
        agentId: conversation.agent_id,
        profileId,
        orgId: conversation.org_id ?? undefined,
      });
    }

    const conversationId = conversation.id;

    const history =
      await conversationService.getMessageHistory(
        conversationId
      );

    /*
     * Consume quota before saving the user message.
     */
    const quota =
      await quotaService.consumeAuthenticatedPrompt(
        profileId
      );

    if (!quota.allowed) {
      throw new AppError(
        429,
        "You have reached your AI prompt limit. Please try again after your quota resets."
      );
    }

    /*
     * Save the user message only after quota validation.
     */
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
          orgId: conversation.org_id ?? undefined,
          memberId: memberId ?? undefined,
          role,
          accessToken,
        },
      });

    /*
     * Save the assistant response.
     */
    await conversationService.createMessage({
      conversationId,
      role: "assistant",
      content: response.message,
    });

    return res.status(200).json({
      message: response.message,
      conversationId,
      sources: response.sources,
      citations: response.citations,
      confirmation: response.confirmation,
      quota: {
        promptsUsed: quota.promptsUsed,
        promptsRemaining: quota.promptsRemaining,
        limit: quota.limit,
        windowExpiresAt: quota.windowExpiresAt,
      },
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
    const accessToken = req.cookies.accessToken;

    if (!profileId || !role || !accessToken) {
      throw new AppError(401, "Unauthorized");
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