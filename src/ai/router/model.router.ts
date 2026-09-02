import {
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "../models/ai-model.interface";
import { AIModelRouter } from "./ai-model-router";
import { config } from "../../config/environment";

export class ModelRouter implements AIModelRouter {
  private models: Map<string, AIModel> = new Map();

  register(model: AIModel): void {
    this.models.set(model.id, model);
  }

  async generate(
    request: AIModelRequest
  ): Promise<AIModelResponse> {
    const modelIds = request.models?.length
      ? request.models
      : config.AI.models;

    let lastError: unknown;

    for (const modelId of modelIds) {
      const model = this.models.get(modelId);

      if (!model) {
        lastError = new Error(
          `AI model is not registered: ${modelId}`
        );

        console.error(
          `AI model is not registered: ${modelId}`
        );

        continue;
      }

      try {
        return await model.generate(request);
      } catch (error) {
        lastError = error;

        console.error(
          `AI model failed: ${modelId}`,
          error
        );
      }
    }

    throw lastError ?? new Error("No AI model available");
  }
}