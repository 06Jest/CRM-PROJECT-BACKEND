import { Mistral } from "@mistralai/mistralai";

import {
  AIModelMetadata,
  AIModelRequest,
  AIModelResponse,
  AITool,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

const mapToolsToMistral = (tools?: AITool[]) => {
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

export class MistralModel implements AIModel {
  id: string;
  provider = "mistral" as const;
  metadata: AIModelMetadata = {
    contextWindow: 256_000,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsToolCalling: true,
    supportsStructuredOutput: false,
    isLocal: false,
  };
  private client: Mistral;

  constructor(modelId: string) {
    this.id = modelId;

    this.client = new Mistral({
      apiKey: config.AI.providers.mistral.apiKey,
    });
  }
  

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    const response =
      await this.client.chat.complete({
        model: this.id,
        messages: [
          {
            role: "system",
            content: request.systemPrompt,
          },
          ...request.messages.map((message) => ({
            role: message.role === "assistant"
              ? ("assistant" as const)
              : ("user" as const),
            content: message.content,
          })),
        ],
        temperature: request.temperature,
        maxTokens: request.maxTokens,
        tools: mapToolsToMistral(request.tools),
      });

    const usage = response.usage;

    return {
  content:
    typeof response.choices?.[0]?.message?.content ===
    "string"
      ? response.choices[0].message.content
      : "",

  model: this.id,

  toolCalls: response.choices?.[0]?.message?.toolCalls?.map(
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
}