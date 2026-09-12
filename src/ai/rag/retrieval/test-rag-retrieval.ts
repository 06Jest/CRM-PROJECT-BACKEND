import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { RagRetrievalService } from "./rag-retrieval.service";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";

async function main() {
  const embeddingService = new CloudflareEmbeddingService();
  const vectorStore = new SupabaseVectorStoreService();

  const retrievalService = new RagRetrievalService(
    embeddingService,
    vectorStore
  );

  const query = "What does uniThread help users manage?";

  console.log("Running RAG retrieval...");

  const results = await retrievalService.retrieve(query, {
    topK: 5,
    filter: {
      profileId: "f11a9833-263a-4f64-8845-f63426b2089b",
    },
  });

  console.log(`Retrieved ${results.length} result(s).`);

  for (const [index, result] of results.entries()) {
    console.log(`\nResult ${index + 1}`);
    console.log("Source ID:", result.metadata.sourceId);
    console.log("Title:", result.metadata.title);
    console.log("Content:", result.content);
  }
}

main().catch((error) => {
  console.error("RAG retrieval test failed:", error);
  process.exit(1);
});