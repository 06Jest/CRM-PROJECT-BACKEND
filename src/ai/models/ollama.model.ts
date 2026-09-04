import {
  AIModelMetadata,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

interface OllamaChatResponse {
  message?: {
    content?: string;
  };
  prompt_eval_count?: number;
  eval_count?: number;
}

export class OllamaModel implements AIModel {
  id: string;
  provider = "local" as const;
  metadata: AIModelMetadata = {
    contextWindow: 0,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsToolCalling: false,
    supportsStructuredOutput: false,
    isLocal: true,
  };
  constructor(modelId: string) {
    this.id = modelId;
  }

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    const response = await fetch(
      `${config.AI.providers.local.baseUrl}/api/chat`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
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
                    ? "assistant"
                    : "user",
                content: message.content,
              })),
          ],
          stream: false,
          think: false,
          options: {
            temperature: request.temperature,
            num_predict: request.maxTokens,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Ollama request failed (${response.status}): ${errorText}`
      );
    }

    const data =
      (await response.json()) as OllamaChatResponse;

    return {
      content: data.message?.content ?? "",
      model: this.id,
      usage: {
        inputTokens: data.prompt_eval_count,
        outputTokens: data.eval_count,
        totalTokens:
          typeof data.prompt_eval_count === "number" &&
          typeof data.eval_count === "number"
            ? data.prompt_eval_count +
              data.eval_count
            : undefined,
      },
    };
  }
}