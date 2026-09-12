import "dotenv/config";

import { NotesDocumentLoader } from "./notes-document.loader";

const main = async (): Promise<void> => {
  const orgId = process.env.TEST_ORG_ID;
  const memberId = process.env.TEST_MEMBER_ID;
  const accessToken = process.env.TEST_ACCESS_TOKEN;

  if (!orgId || !memberId || !accessToken) {
    throw new Error(
      "Missing TEST_ORG_ID, TEST_MEMBER_ID, or TEST_ACCESS_TOKEN environment variables."
    );
  }

  const loader = new NotesDocumentLoader({
    orgId,
    memberId,
    accessToken,
  });

  const documents = await loader.load();

  console.log(`Loaded ${documents.length} note documents.`);

  for (const [index, document] of documents.entries()) {
    console.log(`\nDocument ${index + 1}`);
    console.log("Metadata:", document.metadata);
    console.log("Content:", document.content);
  }
};

main().catch((error: unknown) => {
  console.error("Notes loader test failed:", error);
  process.exit(1);
});