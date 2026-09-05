// import { GeminiModel } from "./gemini.model";

// async function testGemini() {
//   const modelId = "gemini-3.6-flash";

//   const gemini = new GeminiModel(modelId);

//   const response = await gemini.generate({
//     systemPrompt: "You are a helpful CRM assistant.",

//     messages: [
//       {
//         role: "user",
//         content: "What is a CRM? Answer in one sentence.",
//       },
//     ],

//     temperature: 0.2,
//     maxTokens: 100,
//   });

//   console.log(response);
// }

// testGemini().catch((error) => {
//   console.error("Gemini test failed:", error);
//   process.exit(1);
// });

// import { CloudflareModel } from "./cloudflare.model";
// import { config } from "../../config/environment";
import { toolRegistry } from "../tools";
import router from "../router/model.registry";

async function testCloudflare() {
  // const cloudflare = new CloudflareModel(
  //   "@cf/zai-org/glm-4.7-flash",
  //   config.AI.providers.cloudflare.accountId!
  // );

  const createNoteTool = toolRegistry.get("create_note");

  console.dir(createNoteTool, { depth: null });

    const response = await router.generate(
    {
      id: "@cf/zai-org/glm-4.7-flash",
      provider: "cloudflare",
    },
    {
      systemPrompt: "You are a helpful CRM assistant.",
      messages: [
        {
          role: "user",
          content: "What is a CRM? Answer in one sentence.",
        },
      ],
      tools: [createNoteTool],
      temperature: 0.2,
      maxTokens: 500,
    }
  );

  console.dir(response, { depth: null });
}

testCloudflare().catch((error) => {
  console.error("Cloudflare test failed:", error);
  process.exit(1);
});