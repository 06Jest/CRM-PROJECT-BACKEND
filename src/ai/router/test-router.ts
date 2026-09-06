import router from "./model.registry";

async function testRouter() {
  console.log("Registered models:");

  for (const model of router.getModels()) {
    console.log({
      id: model.id,
      provider: model.provider,
      metadata: model.metadata,
    });
  }

  console.log("\n");

  console.log("\nTesting fallback chain...");

  const response = await router.generate(
    {
      id: "gemini-3.6-flash",
      provider: "gemini",
    },
    {
      systemPrompt: "You are a helpful CRM assistant.",

      messages: [
        {
          role: "user",
          content: "What is a CRM? Answer in one sentence.",
        },
      ],

      temperature: 0.2,
      maxTokens: 100,
    }
  );

  console.log("Final response:", response);

 }

testRouter().catch((error) => {
  console.error("Router test failed:", error);
  process.exit(1);
});