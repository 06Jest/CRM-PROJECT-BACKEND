import {
  AIModelRequest,
  AIModelResponse,
  AIProvider,
} from "../types/ai.types";

export interface AIModel {
  id: string;
  provider: AIProvider;

  generate(
    request: AIModelRequest
  ): Promise<AIModelResponse>;
}