

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
    contextWindow: 7_968,
    maxOutputTokens: 0,
    supportsStreaming: false,
    supportsToolCalling: true,
    supportsStructuredOutput: false,
    isLocal: false,
  };

  constructor(
    modelId: string,
    private readonly accountId: string
  ) {
    this.id = modelId;
  }

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    console.dir(
      {
        tools: request.tools,
      },
      { depth: null }
    );
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.id}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.AI.providers.cloudflare.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "system",
              content: request.systemPrompt,
            },
            ...request.messages.map((message) => ({
              role:
                message.role === "assistant"
                  ? "assistant"
                  : message.role === "tool"
                    ? "tool"
                    : "user",
              content: message.content,
              ...(message.toolCalls?.length
                ? {
                    tool_calls: message.toolCalls.map((toolCall) => ({
                      id: toolCall.id,
                      type: "function",
                      function: {
                        name: toolCall.name,
                        arguments: JSON.stringify(
                          toolCall.arguments
                        ),
                      },
                    })),
                  }
                : {}),
              ...(message.toolCallId
                ? {
                    tool_call_id: message.toolCallId,
                  }
                : {}),
            })),
          ],
          max_tokens: request.maxTokens,
          ...(request.tools?.length
            ? {
                tools: request.tools.map((tool) => ({
                  type: "function",
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
                              description: parameter.description ?? "",
                              ...(parameter.enum
                                ? {
                                    enum: parameter.enum,
                                  }
                                : {}),
                            },
                          ]
                        )
                      ),
                    required: Object.keys(tool.parameters),
                  },

                  },
                })),
                tool_choice: "required",
              }
            : {}),
        }),
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();

      throw new Error(
        `Cloudflare API error (${response.status}): ${errorBody}`
      );
    }

    interface CloudflareChatResponse {
      result?: {
        choices?: Array<{
          message?: {
            content?: string;
            tool_calls?: Array<{
              id?: string;
              type?: string;
              function?: {
                name?: string;
                arguments?: string;
              };
            }>;
          };
        }>;
      };
    }

    const data =
      (await response.json()) as CloudflareChatResponse;

    const message = data.result?.choices?.[0]?.message;

    return {
      content: message?.content ?? "",
      model: this.id,
      toolCalls: message?.tool_calls?.map(
        (toolCall, index) => ({
          id: toolCall.id ?? `call_${index}`,
          name: toolCall.function?.name ?? "",
          arguments: toolCall.function?.arguments
            ? JSON.parse(toolCall.function.arguments)
            : {},
        })
      ),
    };
  }
}