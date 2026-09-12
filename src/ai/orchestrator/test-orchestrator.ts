import { aiOrchestrator } from "./ai-orchestrator";

async function testRagOrchestrator() {
  console.log("Testing AI orchestrator with RAG...\n");

  const accessToken = process.env.TEST_ACCESS_TOKEN;
  const memberId = process.env.TEST_MEMBER_ID;
  const profileId = process.env.TEST_PROFILE_ID;
  const orgId = process.env.TEST_ORG_ID;

  if (!accessToken) {
    throw new Error(
      "TEST_ACCESS_TOKEN is missing from environment variables."
    );
  }

  if (!memberId) {
    throw new Error(
      "TEST_MEMBER_ID is missing from environment variables."
    );
  }

  if (!profileId) {
    throw new Error(
      "TEST_PROFILE_ID is missing from environment variables."
    );
  }

  if (!orgId) {
    throw new Error(
      "TEST_ORG_ID is missing from environment variables."
    );
  }

  const response = await aiOrchestrator.run({
    agentId: "personal-assistant",
    message: "What are Brightline Solutions' CRM requirements?",
    context: {
      profileId,
      orgId,
      memberId,
      role: "owner",
      accessToken,
    },
  });

  console.log("\nOrchestrator response:");
  console.dir(response, { depth: null });
}

testRagOrchestrator().catch((error) => {
  console.error("\n❌ RAG orchestrator test failed:");
  console.error(error);
  process.exit(1);
});