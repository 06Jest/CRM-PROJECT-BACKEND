import {
  AIModelReference,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "../models/ai-model.interface";
import { AIModelRouter } from "./ai-model-router";

export class ModelRouter implements AIModelRouter {
  private models: Map<string, AIModel> = new Map();

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

      throw error;
    }
  }
}