import {
  AIModelMetadata,
  AIModelReference,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "../models/ai-model.interface";

export interface AIModelRouter {
  register(model: AIModel): void;
  getModel(modelId: string): AIModel;
  getModelMetadata(modelId: string): AIModelMetadata;
  getModels(): AIModel[];
  generate(
    modelReference: AIModelReference,
    request: AIModelRequest
  ): Promise<AIModelResponse>;
}