import {
  AIToolDefinition,
  toolRegistry,
} from "../../tools/tool.registry";
import { AIRequestContext } from "../../types/ai.types";

type OrganizationRole = "owner" | "manager" | "agent";

const isOrganizationRole = (
  role: string
): role is OrganizationRole => {
  return role === "owner" || role === "manager" || role === "agent";
};

export interface McpToolCallResult {
  requiresConfirmation: boolean;
  toolName: string;
  message: string;
  result?: unknown;
}

export const executeMcpTool = async (
  toolName: string,
  arguments_: Record<string, unknown>,
  context: AIRequestContext
): Promise<McpToolCallResult> => {
  const tool: AIToolDefinition = toolRegistry.get(toolName);

  if (
    tool.requiredRoles &&
    (!isOrganizationRole(context.role) ||
      !tool.requiredRoles.includes(context.role))
  ) {
    throw new Error(
      `Role '${context.role}' is not authorized to use tool '${toolName}'.`
    );
  }

  if (tool.requiresConfirmation) {
    return {
      requiresConfirmation: true,
      toolName,
      message: `Tool '${toolName}' requires confirmation before execution.`,
    };
  }

  const result = await tool.execute(arguments_, context);

  return {
    requiresConfirmation: false,
    toolName,
    message: `Tool '${toolName}' executed successfully.`,
    result,
  };
};