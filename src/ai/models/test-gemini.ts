import { GeminiModel } from "./gemini.model";
import { config } from "../../config/environment";

async function testGemini() {
  const modelId = config.AI.models[0];

  if (!modelId) {
    throw new Error("No AI model configured");
  }

  const gemini = new GeminiModel(modelId);

  const response = await gemini.generate({
    systemPrompt: "You are a helpful CRM assistant.",

    messages: [
      {
        role: "user",
        content: "What is a CRM? Answer in one sentence.",
      },
    ],

    temperature: 0.2,
    maxTokens: 100,
  });

  console.log(response);
}

testGemini().catch((error) => {
  console.error("Gemini test failed:", error);
  process.exit(1);
});