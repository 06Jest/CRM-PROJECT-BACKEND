import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";

async function main() {
  const embeddingService = new CloudflareEmbeddingService();
  const vectorStore = new SupabaseVectorStoreService();

  const query = "What is this RAG document about?";

  console.log("Generating query embedding...");

  const queryEmbedding = await embeddingService.embedQuery(query);

  console.log(
    `Query embedding generated with ${queryEmbedding.length} dimensions.`
  );

  const results = await vectorStore.similaritySearch(queryEmbedding, {
    topK: 5,
    filter: {
      profileId: "f11a9833-263a-4f64-8845-f63426b2089b",
    },
  });

  console.log(`Retrieved ${results.length} result(s).`);

  for (const [index, result] of results.entries()) {
    console.log(`\nResult ${index + 1}`);
    console.log("ID:", result.id);
    console.log("Source ID:", result.metadata.sourceId);
    console.log("Title:", result.metadata.title);
    console.log("Content:", result.content);
  }
}

main().catch((error) => {
  console.error("Similarity search test failed:", error);
  process.exit(1);
});