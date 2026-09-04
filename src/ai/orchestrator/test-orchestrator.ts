import { aiOrchestrator } from "./ai-orchestrator";

async function testOrchestrator() {
  console.log("Testing AI Orchestrator with tool calling...\n");

  const response = await aiOrchestrator.run({
    agentId: "personal-assistant",
    message:
  "Create a private personal note titled 'AI Created Note' with the content 'This note was created by my AI assistant.'",
    context: {
    profileId: "f11a9833-263a-4f64-8845-f63426b2089b",
    orgId: "46924e76-354d-4a96-8bce-a85412b78f2c",
    memberId: "03f38dac-b347-44fc-8a36-fbee1fc2b9a2",
    role: "owner",
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiaXNzIjoic3VwYWJhc2UiLCJzdWIiOiJmMTFhOTgzMy0yNjNhLTRmNjQtODg0NS1mNjM0MjZiMjA4OWIiLCJyb2xlIjoiYXV0aGVudGljYXRlZCIsImVtYWlsIjoianV1em91eGtlbkBnbWFpbC5jb20iLCJwcm9maWxlX2lkIjoiZjExYTk4MzMtMjYzYS00ZjY0LTg4NDUtZjYzNDI2YjIwODliIiwib3JnX2lkIjoiNDY5MjRlNzYtMzU0ZC00YTk2LThiY2UtYTg1NDEyYjc4ZjJjIiwibWVtYmVyX2lkIjoiMDNmMzhkYWMtYjM0Ny00NGZjLThhMzYtZmJlZTFmYzJiOWEyIiwidXNlcl9tZXRhZGF0YSI6eyJyb2xlIjoib3duZXIifSwiaWF0IjoxNzg4NTI4MzEyLCJleHAiOjE3ODg1MjkyMTJ9.VgEi2ZW5hc3idoGUTXYt8qB5v6Ww13nfVCdwCvsXb9o",
  },
  });

  console.log("\nFinal AI response:");
  console.dir(response, { depth: null });
}

testOrchestrator().catch((error) => {
  console.error("Orchestrator test failed:", error);
  process.exit(1);
});