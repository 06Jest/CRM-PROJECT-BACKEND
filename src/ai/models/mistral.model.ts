import { Mistral } from "@mistralai/mistralai";

import {
  AIModelMetadata,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

export class MistralModel implements AIModel {
  id: string;
  provider = "mistral" as const;
  metadata: AIModelMetadata = {
    contextWindow: 256_000,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsToolCalling: false,
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
      });

    const usage = response.usage;

    return {
      content:
        typeof response.choices?.[0]?.message?.content ===
        "string"
          ? response.choices[0].message.content
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
}