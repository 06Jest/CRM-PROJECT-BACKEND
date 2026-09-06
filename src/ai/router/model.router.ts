import {
  AIModelReference,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "../models/ai-model.interface";
import { AIModelRouter } from "./ai-model-router";

export class ModelRouter implements AIModelRouter {
  private models: Map<string, AIModel> = new Map();

  private fallbackModels: string[] = [
    "gemini-3.6-flash",
    "openai/gpt-oss-20b",
    "@cf/zai-org/glm-4.7-flash",
    "ministral-3b-2512",
    "openai/gpt-oss-120b",
    "openrouter/free",
  ];

  register(model: AIModel): void {
    this.models.set(model.id, model);
  }

  getModel(modelId: string): AIModel {
    const model = this.models.get(modelId);

    if (!model) {
      throw new Error(`AI model not found: ${modelId}`);
    }

    return model;
  }

  getModelMetadata(modelId: string) {
    return this.getModel(modelId).metadata;
  }

  getModels(): AIModel[] {
    return Array.from(this.models.values());
  }

  async generate(
    modelReference: AIModelReference,
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    const model = this.models.get(modelReference.id);

    if (!model) {
      throw new Error(
        `AI model not found: ${modelReference.id}`
      );
    }

    if (model.provider !== modelReference.provider) {
      throw new Error(
        `AI model provider mismatch: expected ${modelReference.provider}, got ${model.provider}`
      );
    }

    try {
      return await model.generate(request);
    } catch (error) {
      console.error(
        `AI model failed: ${model.id}`,
        error
      );

      for (const fallbackModelId of this.fallbackModels) {
        if (fallbackModelId === model.id) {
          continue;
        }

        const fallbackModel = this.models.get(fallbackModelId);

        if (!fallbackModel) {
          continue;
        }

        try {
          console.log(
            `Trying fallback AI model: ${fallbackModel.id}`
          );

          return await fallbackModel.generate(request);
        } catch (fallbackError) {
          console.error(
            `Fallback AI model failed: ${fallbackModel.id}`,
            fallbackError
          );
        }
      }

      throw error;
    }
  }
}