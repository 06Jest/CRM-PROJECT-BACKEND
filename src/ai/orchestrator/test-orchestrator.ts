// // import { aiOrchestrator } from "./ai-orchestrator";

// // async function testOrchestrator() {
// //   console.log("Testing AI Orchestrator with tool calling...\n");

// //   const response = await aiOrchestrator.run({
// //     agentId: "personal-assistant",
// //     message:
// //   "Create a private personal note titled 'AI Created Note' with the content 'This note was created by my AI assistant.'",
// //     context: {
// //     profileId: "f11a9833-263a-4f64-8845-f63426b2089b",
// //     orgId: "46924e76-354d-4a96-8bce-a85412b78f2c",
// //     memberId: "03f38dac-b347-44fc-8a36-fbee1fc2b9a2",
// //     role: "owner",
// //     accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiaXNzIjoic3VwYWJhc2UiLCJzdWIiOiJmMTFhOTgzMy0yNjNhLTRmNjQtODg0NS1mNjM0MjZiMjA4OWIiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoianV1em91eGtlbkBnbWFpbC5jb20iLCJwcm9maWxlX2lkIjoiZjExYTk4MzMtMjYzYS00ZjY0LTg4NDUtZjYzNDI2YjIwODliIiwib3JnX2lkIjoiNDY5MjRlNzYtMzU0ZC00YTk2LThiY2UtYTg1NDEyYjc4ZjJjIiwibWVtYmVyX2lkIjoiMDNmMzhkYWMtYjM0Ny00NGZjLThhMzYtZmJlZTFmYzJiOWEyIiwidXNlcl9tZXRhZGF0YSI6eyJyb2xlIjoib3duZXIifSwiaWF0IjoxNzg4NTI4MzEyLCJleHAiOjE3ODg1MjkyMTJ9.VgEi2ZW5hc3idoGUTXYt8qB5v6Ww13nfVCdwCvsXb9o",
// //   },
// //   });

// //   console.log("\nFinal AI response:");
// //   console.dir(response, { depth: null });
// // }

// // testOrchestrator().catch((error) => {
// //   console.error("Orchestrator test failed:", error);
// //   process.exit(1);
// // });

// import { toolRegistry } from "../tools";

// async function testCreateNoteValidation() {
//   console.log("Testing create_note argument validation...\n");

//   const createNoteTool = toolRegistry.get("create_note");

//   try {
//     await createNoteTool.execute(
//       {
//         target_type: "INVALID_TYPE",
//         target_id: null,
//         title: "",
//         content: "",
//         visibility: "invalid",
//       },
//       {
//         profileId: "test-profile",
//         orgId: "test-org",
//         memberId: "test-member",
//         role: "owner",
//       }
//     );

//     console.error("❌ TEST FAILED: Invalid arguments were accepted.");
//     process.exit(1);
//   } catch (error) {
//     console.log("✅ TEST PASSED: Invalid arguments were rejected.");
//     console.log(error);
//   }
// }

// testCreateNoteValidation();

import { aiOrchestrator } from "./ai-orchestrator";

async function testConfirmation() {
  console.log("Testing AI confirmation flow...\n");

  const accessToken = process.env.TEST_ACCESS_TOKEN;
  const memberId = process.env.TEST_MEMBER_ID;
  const profileId = process.env.TEST_PROFILE_ID!;

  if (!accessToken) {
    throw new Error(
      "TEST_ACCESS_TOKEN is missing from environment variables."
    );
  }

  const response = await aiOrchestrator.run({
    agentId: "personal-assistant",

    message:
      "Create a private personal note titled 'Confirmation Test' with the content 'This should require confirmation before being created.'",

    context: {
      profileId,
      memberId,
      role: "owner",
      accessToken,
    },
  });

  console.log("\nOrchestrator response:");
  console.dir(response, { depth: null });

  if (!response.confirmation?.required) {
    console.error(
      "\n❌ TEST FAILED: Confirmation was not requested."
    );
    process.exit(1);
  }

  if (response.confirmation.toolCall.name !== "create_note") {
    console.error(
      "\n❌ TEST FAILED: Expected create_note confirmation."
    );
    process.exit(1);
  }

  console.log(
    "\n✅ TEST PASSED: AI requested confirmation before executing the tool."
  );
}

testConfirmation().catch((error) => {
  console.error("\n❌ Confirmation test failed:");
  console.error(error);
  process.exit(1);
});