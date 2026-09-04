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

  console.log("Testing Gemini...");

  const geminiResponse = await router.generate(
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

  console.log("Gemini response:", geminiResponse);

  console.log("\nTesting Gemini tool calling...");

  const toolResponse = await router.generate(
    {
      id: "gemini-3.6-flash",
      provider: "gemini",
    },
    {
      systemPrompt:
        "You are a CRM assistant. Use the available tool when appropriate.",
      messages: [
        {
          role: "user",
          content: "Find the contact named John Smith.",
        },
      ],
      tools: [
        {
          name: "search_contacts",
          description: "Search CRM contacts by name.",
          parameters: {
            name: {
              type: "string",
              description: "The contact's name to search for.",
            },
          },
        },
      ],
      temperature: 0.2,
      maxTokens: 100,
    }
  );

  console.log("Gemini tool response:", toolResponse);

//   console.log("\nTesting Qwen 3.5 4B...");

//   const qwenResponse = await router.generate(
//     {
//       id: "qwen3.5:4b",
//       provider: "local",
//     },
//     {
//       systemPrompt: "You are a helpful CRM assistant.",

//       messages: [
//         {
//           role: "user",
//           content: "What is a CRM? Answer in one sentence.",
//         },
//       ],

//       temperature: 0.2,
//       maxTokens: 100,
//     }
//   );

//   console.log("Qwen response:", qwenResponse);
 }

testRouter().catch((error) => {
  console.error("Router test failed:", error);
  process.exit(1);
});