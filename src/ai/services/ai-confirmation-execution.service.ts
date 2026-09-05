import { AppError } from "../../middleware/error.middleware";
import { AIAgentService } from "./ai-agent.service";
import { AIConfirmationService } from "./ai-confirmation.service";
import {
  AIRequestContext,
} from "../types/ai.types";
import {
  AIToolError,
} from "../tools/tool.registry";
import { toolRegistry } from "../tools";

export class AIConfirmationExecutionService {
  async execute(
    confirmationId: string,
    context: AIRequestContext
  ): Promise<unknown> {
    if (!confirmationId?.trim()) {
      throw new AppError(
        400,
        "Confirmation ID is required."
      );
    }

    if (!context.accessToken) {
      throw new AppError(
        401,
        "Authentication context is required."
      );
    }

    /*
     * 1. Retrieve the pending confirmation.
     */
    const confirmationService =
      new AIConfirmationService(
        context.accessToken
      );

    const confirmation =
      await confirmationService.get(
        confirmationId,
        context.profileId,
        context.orgId
      );

    if (!confirmation) {
      throw new AppError(
        404,
        "AI confirmation not found or has expired."
      );
    }

    /*
     * 2. Verify the current user still has
     *    access to the agent.
     */
    const agentService =
      new AIAgentService(
        context.accessToken
      );

    const agent =
      await agentService.getAuthorizedAgent({
        agentId: confirmation.agentId,
        profileId: context.profileId,
        orgId: confirmation.orgId,
      });

    /*
     * 3. Verify the confirmation belongs to
     *    the current organization context.
     */
    if (confirmation.orgId) {
      if (
        !context.orgId ||
        confirmation.orgId !== context.orgId
      ) {
        throw new AppError(
          403,
          "You cannot execute this confirmation in the current organization context."
        );
      }
    }

    const executionContext: AIRequestContext = {
      ...context,
      ...(confirmation.orgId
        ? { orgId: confirmation.orgId }
        : {}),
    };

    /*
     * 4. Verify the tool still exists.
     */
    const tool = toolRegistry.get(
      confirmation.toolCall.name
    );

    /*
     * 5. Verify the agent is still allowed
     *    to use this tool.
     */
    if (
      !agent.tools.includes(tool.name)
    ) {
      throw new AppError(
        403,
        `AI agent "${agent.id}" is not allowed to use tool "${tool.name}".`
      );
    }

    /*
     * 6. Verify the current role.
     */
    if (
      tool.requiredRoles &&
      !tool.requiredRoles.includes(
        context.role as
          | "owner"
          | "manager"
          | "agent"
      )
    ) {
      throw new AppError(
        403,
        `Role "${context.role}" is not allowed to use tool "${tool.name}".`
      );
    }

    /*
     * 7. Execute the exact arguments that
     *    were originally approved.
     */
    let result: unknown;

    try {
      result = await tool.execute(
        confirmation.toolCall.arguments,
        executionContext
      );
    } catch (error) {
      if (error instanceof AIToolError) {
        throw new AppError(
          400,
          error.message
        );
      }

      throw error;
    }

    /*
     * 8. Consume the confirmation after
     *    successful execution.
     */
    await confirmationService.delete(
      confirmationId
    );

    return result;
  }
}