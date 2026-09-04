import { Mistral } from "@mistralai/mistralai";

import {
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

export class MistralModel implements AIModel {
  id: string;
  provider = "mistral" as const;

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