import Cloudflare from "cloudflare";

import {
  AIModelMetadata,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

export class CloudflareModel implements AIModel {
  id: string;
  provider = "cloudflare" as const;
  metadata: AIModelMetadata = {
    contextWindow: 0,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsToolCalling: false,
    supportsStructuredOutput: false,
    isLocal: false,
};
  private client: Cloudflare;

  constructor(
    modelId: string,
    private readonly accountId: string
  ) {
    this.id = modelId;

    this.client = new Cloudflare({
      apiToken:
        config.AI.providers.cloudflare.apiToken,
    });
  }

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    const response =
      await this.client.ai.run(
        this.id,
        {
          account_id: this.accountId,
          messages: [
            {
              role: "system",
              content: request.systemPrompt,
            },
            ...request.messages.map((message) => ({
              role:
                message.role === "assistant"
                  ? ("assistant" as const)
                  : ("user" as const),
              content: message.content,
            })),
          ],
        }
      );

    return {
      content:
        typeof response === "string"
          ? response
          : JSON.stringify(response),
      model: this.id,
    };
  }
}