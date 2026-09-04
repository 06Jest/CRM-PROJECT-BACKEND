import {
  AIModelReference,
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

export interface AIModelRouter {
  generate(
    modelReference: AIModelReference,
    request: AIModelRequest
  ): Promise<AIModelResponse>;
}