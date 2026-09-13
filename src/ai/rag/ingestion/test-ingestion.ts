import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { DocumentSplitterService } from "../splitters/document-splitter.service";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";
import { DocumentIngestionService } from "./document-ingestion.service";
import { KnowledgeBaseIngestionService } from "./knowledge-base-ingestion.service";
import { RagIngestionService } from "./rag-ingestion.service";

async function main() {
  const embeddingService = new CloudflareEmbeddingService();
  const vectorStore = new SupabaseVectorStoreService();
  const splitter = new DocumentSplitterService();

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

  console.log("Ingested document count:", documentIds.length);
  console.log("Ingested document IDs:", documentIds);
}

main().catch((error) => {
  console.error("Knowledge-base ingestion failed:", error);
  process.exit(1);
});