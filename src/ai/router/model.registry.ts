import { GeminiModel } from "../models/gemini.model";
import { GroqModel } from "../models/groq.model";
import { MistralModel } from "../models/mistral.model";
import { CloudflareModel } from "../models/cloudflare.model";
import { OpenRouterModel } from "../models/openrouter.model";
import { ModelRouter } from "./model.router";
import { config } from "../../config/environment";
import { OllamaModel } from "../models/ollama.model";

const router = new ModelRouter();

const geminiFlash = new GeminiModel(
  "gemini-3.6-flash"
);

const groqModel = new GroqModel(
  // "llama-3.3-70b-versatile"
  "openai/gpt-oss-20b"
);

const mistralModel = new MistralModel(
  "mistral-small-latest"
);

const cloudflareModel = new CloudflareModel(
  "@cf/zai-org/glm-4.7-flash",
  config.AI.providers.cloudflare.accountId!
);

const openRouterModel = new OpenRouterModel(
  "openai/gpt-oss-120b"
);

const qwen35 = new OllamaModel(
  "qwen3.5:4b"
);

router.register(geminiFlash);
router.register(groqModel);
router.register(mistralModel);
router.register(cloudflareModel);
router.register(openRouterModel);
router.register(qwen35);

export { router };
export default router;