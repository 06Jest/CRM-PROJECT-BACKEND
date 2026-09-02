import { GoogleGenAI } from "@google/genai";

import {
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "./ai-model.interface";
import { config } from "../../config/environment";

export class GeminiModel implements AIModel {
  id: string;
  provider = "google";

  private client: GoogleGenAI;

  constructor(modelId: string) {
    this.id = modelId;

    this.client = new GoogleGenAI({
      apiKey: config.GEMINI.apiKey,
    });
  }

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    const response = await this.client.models.generateContent({
      model: this.id,
      contents: request.messages
        .filter((message) => message.role !== "system")
        .map((message) => ({
          role: message.role === "assistant" ? "model" : "user",
          parts: [
            {
              text: message.content,
            },
          ],
        })),
      config: {
        systemInstruction: request.systemPrompt,
        temperature: request.temperature,
        maxOutputTokens: request.maxTokens,
      },
    });

    return {
      content: response.text ?? "",
      model: this.id,
    };
  }
}