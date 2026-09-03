import {
  AIRequest,
  AIResponse,
  AIMessage,
} from "./types/ai.types";

import { agentRegistry } from "./agents/agent.registry";
import modelRouter from "./router/model.registry";

export class AIOrchestrator {
  async run(request: AIRequest): Promise<AIResponse> {
    console.log(" AI ORCHESTRATOR HIT");
    const agent = agentRegistry.get(request.agentId);

    const { profileId, orgId, role } = request.context;

    console.log("AI request context:", {
      profileId,
      orgId,
      role,
    });

    const messages: AIMessage[] = [
      ...(request.history ?? []),
      {
        role: "user",
        content: request.message,
      },
    ];

    console.log("AI MODEL:", agent.model);
    const response = await modelRouter.generate({
      models: [agent.model],
      systemPrompt: agent.systemPrompt,
      messages,
      temperature: 0.2,
      maxTokens: 1000,
    });

    return {
      message: response.content,
      conversationId: request.conversationId,
    };
  }
}

export const aiOrchestrator = new AIOrchestrator();