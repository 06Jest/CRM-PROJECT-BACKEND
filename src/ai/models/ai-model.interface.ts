import {
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

export interface AIModel {
  id: string;
  provider: string;

  generate(
    request: AIModelRequest
  ): Promise<AIModelResponse>;
}