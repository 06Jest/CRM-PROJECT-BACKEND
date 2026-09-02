import {
  AIModelRequest,
  AIModelResponse,
} from "../types/ai.types";

import { AIModel } from "../models/ai-model.interface";

export interface AIModelRouter {
  generate(
    request: AIModelRequest
  ): Promise<AIModelResponse>;
}