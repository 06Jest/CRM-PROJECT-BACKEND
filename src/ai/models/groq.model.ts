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
    contextWindow: 0,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsToolCalling: false,
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
        temperature: request.temperature,
        max_tokens: request.maxTokens,
      });

    const usage = response.usage;

    return {
      content:
        response.choices[0]?.message?.content ?? "",
      model: this.id,
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