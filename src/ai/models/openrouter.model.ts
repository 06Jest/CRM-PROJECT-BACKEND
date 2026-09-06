import { OpenRouter } from "@openrouter/sdk";

import {
  AIModelMetadata,
  AIModelRequest,
  AIModelResponse,
  AITool,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

const mapToolsToOpenRouter = (tools?: AITool[]) => {
  if (!tools?.length) {
    return undefined;
  }

  return tools.map((tool) => ({
    type: "function" as const,
    function: {
      name: tool.name,
      description: tool.description,
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(tool.parameters).map(
            ([name, parameter]) => [
              name,
              {
                type: parameter.type,
                description: parameter.description,
                ...(parameter.enum
                  ? { enum: parameter.enum }
                  : {}),
              },
            ]
          )
        ),
      },
    },
  }));
};

export class OpenRouterModel implements AIModel {
  id: string;
  provider = "openrouter" as const;
  metadata: AIModelMetadata = {
    contextWindow: 131_072,
    maxOutputTokens: 16_384,
    supportsStreaming: false,
    supportsToolCalling: true,
    supportsStructuredOutput: false,
    isLocal: false,
  };
  private client: OpenRouter;

  constructor(modelId: string) {
    this.id = modelId;

    this.client = new OpenRouter({
      apiKey:
        config.AI.providers.openrouter.apiKey,
    });
  }

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
   const response =
    await this.client.chat.send({
      chatRequest: {
        model: this.id,
        messages: [
          {
            role: "system",
            content: request.systemPrompt,
          },
          ...request.messages
            .filter(
              (message) =>
                message.role !== "tool"
            )
            .map((message) => ({
              role:
                message.role === "assistant"
                  ? ("assistant" as const)
                  : ("user" as const),
              content: message.content,
            })),
        ],
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        tools: mapToolsToOpenRouter(request.tools),
        stream: false,
      },
    });

  if ("choices" in response) {

    const message = response.choices?.[0]?.message;
    const usage = response.usage;

    return {
      content:
        typeof message?.content === "string"
          ? message.content
          : "",
      model: this.id,
      toolCalls: message?.toolCalls?.map(
        (toolCall, index) => ({
          id: toolCall.id ?? `call_${index}`,
          name: toolCall.function.name,
          arguments:
            typeof toolCall.function.arguments === "string"
              ? JSON.parse(toolCall.function.arguments)
              : toolCall.function.arguments,
        })
      ),
      usage: usage
        ? {
            inputTokens: usage.promptTokens,
            outputTokens: usage.completionTokens,
            totalTokens: usage.totalTokens,
          }
        : undefined,
    };
  }

  throw new Error(
    "OpenRouter returned a streaming response unexpectedly"
  );
  }
}