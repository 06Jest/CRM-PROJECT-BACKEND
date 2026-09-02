import { GeminiModel } from "../models/gemini.model";
import { ModelRouter } from "./model.router";
import { config } from "../../config/environment";

const router = new ModelRouter();

for (const modelId of config.AI.models) {
  if (modelId.startsWith("gemini-")) {
    router.register(new GeminiModel(modelId));
  }
}

export default router;