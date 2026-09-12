import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { StaticDocumentLoader } from "../loaders/static-document.loader";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";
import { DocumentSplitterService } from "./../splitters/document-splitter.service";
import { DocumentIngestionService } from "./document-ingestion.service";
import { RagIngestionService } from "./rag-ingestion.service";

async function main() {
  const embeddingService = new CloudflareEmbeddingService();
  const vectorStore = new SupabaseVectorStoreService();
  const documentSplitter = new DocumentSplitterService();

  const documentIngestionService = new DocumentIngestionService(
    documentSplitter,
    embeddingService,
    vectorStore
  );

  const ragIngestionService = new RagIngestionService(
    documentIngestionService
  );

  const loader = new StaticDocumentLoader({
    content: `
      uniThread is a multi-tenant CRM platform.

      It helps organizations manage contacts, leads, deals, tasks,
      notes, and customer interactions.
    `,
    metadata: {
      sourceId: `static-loader-test-${Date.now()}`,
      sourceType: "test",
      profileId: "f11a9833-263a-4f64-8845-f63426b2089b",
      title: "Static Loader Test Document",
    },
  });

  console.log("Loading and ingesting document...");

  const documentIds =
    await ragIngestionService.ingestFromLoader(loader);

  console.log("Ingested document IDs:", documentIds);
}

main().catch((error) => {
  console.error("RAG ingestion test failed:", error);
  process.exit(1);
});