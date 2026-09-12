import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { RagRetrievalService } from "../retrieval/rag-retrieval.service";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";
import { RagContextBuilderService } from "../context/rag-context-builder.service";

async function main() {
  const embeddingService = new CloudflareEmbeddingService();
  const vectorStore = new SupabaseVectorStoreService();

  const retrievalService = new RagRetrievalService(
    embeddingService,
    vectorStore
  );

  const contextBuilder = new RagContextBuilderService();

  const chunks = await retrievalService.retrieve(
    "What notes were created to test the AI system?",
    {
      topK: 5,
      minSimilarity: 0.4,
      filter: {
        organizationId: "46924e76-354d-4a96-8bce-a85412b78f2c",
      },
    }
  );

  const context = contextBuilder.build(chunks);

  console.log("\n=== FORMATTED RAG CONTEXT ===\n");
  console.log(context.text);

  console.log("\n=== SOURCES ===\n");
  console.dir(context.sources, { depth: null });
}

main().catch((error) => {
  console.error("RAG context test failed:", error);
  process.exit(1);
});