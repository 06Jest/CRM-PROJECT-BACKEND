import { GoogleGenAI } from "@google/genai";

import {
  AIModelMetadata,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

export class GeminiModel implements AIModel {
  id: string;
  provider = "gemini" as const;
  metadata: AIModelMetadata = {
    contextWindow: 1_048_576,
    maxOutputTokens: 65_536,
    supportsStreaming: false,
    supportsToolCalling: false,
    supportsStructuredOutput: false,
    isLocal: false,
  };
  private client: GoogleGenAI;

  constructor(modelId: string) {
    this.id = modelId;

    this.client = new GoogleGenAI({
      apiKey: config.AI.providers.gemini.apiKey,
    });
  }

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    const response = await this.client.models.generateContent({
      model: this.id,
      contents: request.messages
        .filter((message) => message.role !== "system")
        .map((message) => {
          if (message.role === "tool") {
            return {
              role: "user",
              parts: [
                {
                  functionResponse: {
                    name: message.toolName ?? "",
                    response: JSON.parse(message.content),
                  },
                },
              ],
            };
          }

          return {
            role: message.role === "assistant" ? "model" : "user",
            parts: [
              ...(message.toolCalls?.length
                ? message.toolCalls.map((toolCall) => ({
                    functionCall: {
                      name: toolCall.name,
                      args: toolCall.arguments,
                    },
                    thoughtSignature: toolCall.thoughtSignature,
                  }))
                : [{ text: message.content }]),
            ],
          };
        }),
      config: {
        systemInstruction: request.systemPrompt,
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,

        ...(request.tools?.length
          ? {
              tools: [
                {
                  functionDeclarations: request.tools.map((tool) => ({
                    name: tool.name,
                    description: tool.description,
                    parametersJsonSchema: {
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
                  })),
                },
              ],
            }
          : {}),
      },
    });

    return {
      content: response.text ?? "",
      model: this.id,
      toolCalls: response.functionCalls?.map((call, index) => {
        const part = response.candidates?.[0]?.content?.parts?.find(
          (part) =>
            part.functionCall?.name === call.name &&
            part.functionCall?.id === call.id
        );

        return {
          id: call.id ?? `call_${index}`,
          name: call.name ?? "",
          arguments: call.args ?? {},
          thoughtSignature: part?.thoughtSignature,
        };
      }),
    };
  }
}