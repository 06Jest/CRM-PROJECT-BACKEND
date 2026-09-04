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
  "llama-3.3-70b-versatile"
);

const mistralModel = new MistralModel(
  "mistral-large-latest"
);

const cloudflareModel = new CloudflareModel(
  "@cf/meta/llama-3.1-8b-instruct",
  config.AI.providers.cloudflare.accountId!
);

const openRouterModel = new OpenRouterModel(
  "meta-llama/llama-3.3-70b-instruct"
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