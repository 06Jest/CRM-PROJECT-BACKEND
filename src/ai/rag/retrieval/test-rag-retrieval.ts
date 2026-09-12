import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { RagRetrievalService } from "./rag-retrieval.service";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";

async function main() {
  const organizationId = process.env.TEST_ORG_ID;

  if (!organizationId) {
    throw new Error(
      "Missing TEST_ORGANIZATION_ID environment variable."
    );
  }

  const query =
    process.argv.slice(2).join(" ").trim() ||
    "What notes mention a customer's payment issue?";

  const embeddingService = new CloudflareEmbeddingService();
  const vectorStore = new SupabaseVectorStoreService();

  const retrievalService = new RagRetrievalService(
    embeddingService,
    vectorStore
  );

  console.log("Searching RAG knowledge...");
  console.log("Query:", query);
  console.log("Organization:", organizationId);

  const results = await retrievalService.retrieve(query, {
    topK: 5,
    minSimilarity: 0.7,
    filter: {
      organizationId,
    },
  });

  console.log(`\nFound ${results.length} matching chunks:\n`);

  for (const [index, result] of results.entries()) {
    console.log(`--- Result ${index + 1} ---`);
    console.log(
      "Similarity:",
      result.similarity?.toFixed(4) ?? "unavailable"
    );
    console.log("Source ID:", result.metadata.sourceId);
    console.log("Source type:", result.metadata.sourceType);
    console.log("Title:", result.metadata.title ?? "(untitled)");
    console.log("Chunk index:", result.metadata.chunkIndex);
    console.log("Content:");
    console.log(result.content);
    console.log();
  }
}

main().catch((error) => {
  console.error("RAG retrieval test failed:", error);
  process.exit(1);
});