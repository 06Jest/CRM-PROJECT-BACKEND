import { OpenRouter } from "@openrouter/sdk";

import {
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

export class OpenRouterModel implements AIModel {
  id: string;
  provider = "openrouter" as const;

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
        stream: false,
      },
    });

  if ("choices" in response) {
    const usage = response.usage;

    const content =
      response.choices?.[0]?.message?.content;

    return {
      content:
        typeof content === "string"
          ? content
          : "",
      model: this.id,
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