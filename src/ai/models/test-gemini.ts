import { GeminiModel } from "./gemini.model";

async function testGemini() {
  const modelId = "gemini-3.6-flash";

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