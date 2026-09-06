import Groq from "groq-sdk";

import {
  AIModelMetadata,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

export class GroqModel implements AIModel {
  id: string;
  provider = "groq" as const;
  metadata: AIModelMetadata = {
    contextWindow: 131_072,
    maxOutputTokens: 32_768,
    supportsStreaming: false,
    supportsToolCalling: true,
    supportsStructuredOutput: false,
    isLocal: false,
  };
  private client: Groq;

  constructor(modelId: string) {
    this.id = modelId;

    this.client = new Groq({
      apiKey: config.AI.providers.groq.apiKey,
    });
  }

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    const response =
      await this.client.chat.completions.create({
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
        tools: request.tools?.map((tool) => ({
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
                      ...(parameter.nullable
                        ? { type: ["string", "null"] }
                        : {}),
                    },
                  ]
                )
              ),
            },
          },
        })),
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      });

    const usage = response.usage;

    const message = response.choices[0]?.message;

    return {
      content: message?.content ?? "",
      model: this.id,
      toolCalls: message?.tool_calls?.map((toolCall) => ({
        id: toolCall.id,
        name: toolCall.function.name,
        arguments: JSON.parse(
          toolCall.function.arguments
        ),
      })),
      usage: usage
        ? {
            inputTokens: usage.prompt_tokens,
            outputTokens: usage.completion_tokens,
            totalTokens: usage.total_tokens,
          }
        : undefined,
    };
  }
}