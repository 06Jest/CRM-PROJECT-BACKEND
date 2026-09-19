import { DocumentSplitterService } from "../splitters/document-splitter.service";
import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";
import { DocumentIngestionService } from "../ingestion/document-ingestion.service";
import { RagIngestionService } from "../ingestion/rag-ingestion.service";
import { KnowledgeBaseIngestionService } from "../ingestion/knowledge-base-ingestion.service";

async function main(): Promise<void> {
  console.log("Starting platform knowledge ingestion...");

  const splitter = new DocumentSplitterService();
  const embeddingService = new CloudflareEmbeddingService();
  const vectorStore = new SupabaseVectorStoreService();

  const documentIngestionService = new DocumentIngestionService(
    splitter,
    embeddingService,
    vectorStore
  );

  const ragIngestionService = new RagIngestionService(
    documentIngestionService
  );

  const knowledgeBaseIngestionService =
    new KnowledgeBaseIngestionService(ragIngestionService);

  const documentIds =
    await knowledgeBaseIngestionService.ingestPlatformKnowledge();

  console.log(
    `Knowledge ingestion completed. Processed ${documentIds.length} documents.`
  );

  console.log("Document IDs:", documentIds);
}

main().catch((error: unknown) => {
  console.error("Knowledge ingestion failed:", error);
  process.exit(1);
});