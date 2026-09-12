import "dotenv/config";

import { NotesDocumentLoader } from "../loaders/notes-document.loader";
import { DocumentSplitterService } from "../splitters/document-splitter.service";
import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";
import { DocumentIngestionService } from "./document-ingestion.service";
import { RagIngestionService } from "./rag-ingestion.service";

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

  const documentSplitter = new DocumentSplitterService();
  const embeddingService = new CloudflareEmbeddingService();
  const vectorStore = new SupabaseVectorStoreService();

  const documentIngestionService = new DocumentIngestionService(
    documentSplitter,
    embeddingService,
    vectorStore
  );

  const ragIngestionService = new RagIngestionService(
    documentIngestionService
  );

  console.log("Loading and ingesting CRM notes...");

  const documentIds = await ragIngestionService.ingestFromLoader(loader);

  console.log("Ingested document IDs:", documentIds);
};

main().catch((error: unknown) => {
  console.error("Notes ingestion test failed:", error);
  process.exit(1);
});