import {
  AIModelMetadata,
  AIModelRequest,
  AIModelResponse,
  AIProvider,
} from "../types/ai.types";

export interface AIModel {
  id: string;
  provider: AIProvider;
  metadata: AIModelMetadata;

  generate(
    request: AIModelRequest
  ): Promise<AIModelResponse>;
}