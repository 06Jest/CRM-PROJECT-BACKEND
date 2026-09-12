import { DocumentSplitterService } from "./document-splitter.service";

const splitterService = new DocumentSplitterService();

const document = {
  content: `
    This is a test document for the uniThread RAG pipeline.

    It contains multiple paragraphs so we can verify that the document
    splitter produces chunks correctly.

    The splitter should preserve the document metadata and assign a
    sequential chunk index to every generated chunk.
  `,
  metadata: {
    sourceId: "test-document-001",
    sourceType: "test",
    profileId: "00000000-0000-0000-0000-000000000001",
    title: "Test RAG Document",
  },
};

const run = async () => {
  const chunks = await splitterService.splitDocument(document);

  console.log(`Generated ${chunks.length} chunks.`);

  chunks.forEach((chunk, index) => {
    console.log(`\n--- Chunk ${index} ---`);
    console.log(chunk.content);
    console.log("Metadata:", chunk.metadata);
  });
};

run().catch((error) => {
  console.error("Document splitter test failed:", error);
  process.exitCode = 1;
});