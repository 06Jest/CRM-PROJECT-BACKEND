import { aiOrchestrator } from "./ai-orchestrator";

async function testOrchestrator() {
  const response = await aiOrchestrator.run({
    agentId: "crm-assistant",

    message:
      "What is a CRM? Explain it in one short sentence.",

    context: {
      profileId: "test-profile",
      orgId: "test-org",
      role: "Agent",
    },
  });

  console.log(response);
}

testOrchestrator().catch((error) => {
  console.error("AI orchestrator test failed:", error);
  process.exit(1);
});