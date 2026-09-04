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