import {
  AIRequest,
  AIResponse,
  AIMessage,
} from "../types/ai.types";

import { agentRegistry } from "../agents/agent.registry";
import modelRouter from "../router/model.registry";
import { toolRegistry } from "../tools";
import { AIToolError } from "../tools/tool.registry";
import { AIConfirmationService } from "../services/ai-confirmation.service";
import { ragContextService } from "../rag/rag.module";
import { ragCitationParserService } from "../rag/citations/rag-citation-parser.service";
import crypto from "crypto";

const MAX_TOOL_ROUNDS = 5;

export class AIOrchestrator {
  async run(request: AIRequest): Promise<AIResponse> {
    if (!request.agentId?.trim()) {
      throw new Error("AI agent ID is required.");
    }

    if (!request.message?.trim()) {
      throw new Error("AI message cannot be empty.");
    }

    if (request.message.length > 5_000) {
      throw new Error("AI message is too long.");
    }

    if (!request.context.isPublic) {
      if (!request.context.accessToken) {
        throw new Error("AI access token context is required.");
      }

      if (!request.context.profileId?.trim()) {
        throw new Error("AI profile context is required.");
      }
    }

    const agent = agentRegistry.get(request.agentId);

    const confirmationService = request.context.isPublic
      ? null
      : new AIConfirmationService(request.context.accessToken!);

    if (
      agent.scope === "organization" &&
      !request.context.orgId
    ) {
      throw new Error(
        "Organization AI agents require organization context."
      );
    }

    const messages: AIMessage[] = [
      ...(request.history ?? []),
      {
        role: "user",
        content: request.message,
      },
    ];

    const tools = agent.tools.map((toolName) => {
      return toolRegistry.get(toolName);
    });

    const ragScope =
      agent.scope === "platform"
        ? {
            scopeType: "platform" as const,
          }
        : agent.scope === "organization"
          ? {
              scopeType: "organization" as const,
              organizationId: request.context.orgId,
            }
          : {
              scopeType: "profile" as const,
              profileId: request.context.profileId,
            };

    const ragContext = await ragContextService.prepare({
      query: request.message,
      ...ragScope,
      topK: 7,
      minSimilarity: 0.7,
    });

    const systemPrompt = [
      agent.systemPrompt,
      "",
      ragContext.referenceSection,
    ].join("\n");

    let response = await modelRouter.generate(
      agent.model,
      {
        systemPrompt,
        messages,
        tools,
        temperature: 0.2,
        maxTokens: 1000,
      }
    );

    if (response.toolCalls?.length) {
      let toolRound = 0;

      while (response.toolCalls?.length) {
        toolRound++;

        if (toolRound > MAX_TOOL_ROUNDS) {
          throw new Error(
            `AI tool execution exceeded the maximum of ${MAX_TOOL_ROUNDS} rounds.`
          );
        }

        messages.push({
          role: "assistant",
          content: response.content,
          toolCalls: response.toolCalls,
        });

        for (const toolCall of response.toolCalls) {
          if (!agent.tools.includes(toolCall.name)) {
            throw new Error(
              `AI agent "${agent.id}" is not allowed to use tool "${toolCall.name}".`
            );
          }

          const tool = toolRegistry.get(toolCall.name);

          if (
            tool.requiredRoles &&
            !tool.requiredRoles.includes(
              request.context.role as "owner" | "manager" | "agent"
            )
          ) {
            throw new Error(
              `Role "${request.context.role}" is not allowed to use tool "${tool.name}".`
            );
          }

          if (tool.requiresConfirmation) {
            if (!confirmationService) {
              throw new Error(
                `Public AI cannot execute tool "${tool.name}".`
              );
            }

            const confirmationId = crypto.randomUUID();

            await confirmationService.create({
              confirmationId,
              profileId: request.context.profileId!,
              ...(request.context.orgId
                ? { orgId: request.context.orgId }
                : {}),
              ...(request.conversationId
                ? {
                    conversationId: request.conversationId,
                  }
                : {}),
              agentId: agent.id,
              toolCall,
              expiresAt: new Date(
                Date.now() + 5 * 60 * 1000
              ).toISOString(),
            });

            return {
              message: `I need your confirmation before executing "${tool.name}".`,
              conversationId: request.conversationId,
              sources: ragContext.context.sources,
              citations: [],
              confirmation: {
                required: true,
                confirmationId,
                toolCall,
              },
            };
          }

          let result: unknown;

          try {
            result = await tool.execute(
              toolCall.arguments,
              request.context
            );
          } catch (error) {
            if (error instanceof AIToolError) {
              result = {
                error: error.message,
              };
            } else {
              throw error;
            }
          }

          messages.push({
            role: "tool",
            content: JSON.stringify(result),
            toolCallId: toolCall.id,
            toolName: toolCall.name,
          });
        }

        response = await modelRouter.generate(
          agent.model,
          {
            systemPrompt,
            messages,
            tools,
            temperature: 0.2,
            maxTokens: 1000,
          }
        );
      }
    }

    const citations = ragCitationParserService.parse(
      response.content,
      ragContext.context.sources
    );

    const cleanedMessage =
      ragCitationParserService.cleanResponseText(response.content);

    const uniqueSources = Array.from(
      new Map(
        ragContext.context.sources.map((source) => [
          source.sourceId,
          source,
        ])
      ).values()
    );

    return {
      message: cleanedMessage,
      conversationId: request.conversationId,
      sources: uniqueSources,
      citations,
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();