import {
  AIRequest,
  AIResponse,
  AIMessage,
} from "../types/ai.types";

import { agentRegistry } from "../agents/agent.registry";
import modelRouter from "../router/model.registry";
import { toolRegistry } from "../tools";

export class AIOrchestrator {
  async run(request: AIRequest): Promise<AIResponse> {
    const agent = agentRegistry.get(request.agentId);
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

    let response = await modelRouter.generate(
      agent.model,
      {
        systemPrompt: agent.systemPrompt,
        messages,
        tools,
        temperature: 0.2,
        maxTokens: 1000,
      }
    );

   if (response.toolCalls?.length) {
      messages.push({
        role: "assistant",
        content: response.content,
        toolCalls: response.toolCalls,
      });

      for (const toolCall of response.toolCalls) {
        const tool = toolRegistry.get(toolCall.name);

        const result = await tool.execute(
          toolCall.arguments,
          request.context
        );

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
          systemPrompt: agent.systemPrompt,
          messages,
          tools,
          temperature: 0.2,
          maxTokens: 1000,
        }
      );
      
    }

    return {
      message: response.content,
      conversationId: request.conversationId,
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();