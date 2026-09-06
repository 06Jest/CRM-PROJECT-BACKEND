import { aiOrchestrator } from "../orchestrator/ai-orchestrator";
import { AIConfirmationExecutionService } from "./ai-confirmation-execution.service";

async function testConfirmationExecution() {
  console.log("Testing AI confirmation execution...\n");

  const accessToken = process.env.TEST_ACCESS_TOKEN;
  const profileId = process.env.TEST_PROFILE_ID!;

  if (!accessToken) {
    throw new Error(
      "TEST_ACCESS_TOKEN is missing from environment variables."
    );
  }

  /*
   * 1. Ask the AI to create a note.
   *    This should stop at confirmation.
   */
  const response = await aiOrchestrator.run({
    agentId: "personal-assistant",

    message:
      "Create a private personal note titled 'Execution Test' with the content 'This note was created through the confirmation execution flow.'",

    context: {
      profileId,
      role: "owner",
      accessToken,
    },
  });

  console.log("\nAI response:");
  console.dir(response, { depth: null });

  if (!response.confirmation?.required) {
    throw new Error(
      "Expected AI to request confirmation."
    );
  }

  const confirmationId =
    response.confirmation.confirmationId;

  console.log(
    `\nConfirmation created: ${confirmationId}`
  );

  /*
   * 2. Approve and execute the confirmation.
   */
  const confirmationExecutionService =
    new AIConfirmationExecutionService();

  const result =
    await confirmationExecutionService.execute(
      confirmationId,
      {
        profileId,
        role: "owner",
        accessToken,
      }
    );

  console.log("\nExecution result:");
  console.dir(result, { depth: null });

  console.log(
    "\n✅ TEST PASSED: Confirmation was approved and the tool executed successfully."
  );
}

testConfirmationExecution().catch((error) => {
  console.error(
    "\n❌ Confirmation execution test failed:"
  );
  console.error(error);
  process.exit(1);
});