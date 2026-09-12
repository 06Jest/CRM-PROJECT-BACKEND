import { DocumentIngestionService } from "../ingestion/document-ingestion.service";
import { DocumentSplitterService } from "./document-splitter.service";

async function main() {
  const splitterService = new DocumentSplitterService();
  const ingestionService = new DocumentIngestionService(splitterService);

  const document = {
    content: `
      UniThread CRM allows organizations to manage leads, contacts, deals, tasks, and activities.

      Organizations can assign leads to team members and track their progress through a Kanban-style workflow.

      Users can also create notes, manage customer information, and communicate through the CRM messaging system.
    `,
    metadata: {
      sourceId: "test-document-001",
      sourceType: "test",
      organizationId: "test-organization-001",
      title: "UniThread CRM Test Document",
    },
  };

  const chunks = await ingestionService.ingestDocument(document);

  console.log("Number of chunks:", chunks.length);

  chunks.forEach((chunk, index) => {
    console.log(`\n--- Chunk ${index} ---`);
    console.log(chunk.content);
    console.log("Metadata:", chunk.metadata);
  });

  try {
    await ingestionService.ingestDocument({
      content: "   ",
      metadata: {
        sourceId: "empty-document",
        sourceType: "test",
      },
    });

    console.error("\nEmpty document test failed: no error was thrown.");
  } catch (error) {
    console.log("\nEmpty document test passed:", error);
  }
}

main().catch((error) => {
  console.error("Document ingestion test failed:", error);
  process.exit(1);
});