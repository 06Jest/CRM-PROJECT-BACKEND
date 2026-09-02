import router from "./model.registry";

async function testRouter() {
  const response = await router.generate({
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

testRouter().catch((error) => {
  console.error("Router test failed:", error);
  process.exit(1);
});