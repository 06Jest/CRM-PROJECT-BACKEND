import { CloudflareEmbeddingService } from "./cloudflare-embedding.service";

async function main() {
  const embeddingService = new CloudflareEmbeddingService();

  const documents = [
    "UniThread CRM helps organizations manage leads, contacts, deals, and tasks.",
    "Organizations can assign leads to team members and track their progress.",
  ];

  const documentEmbeddings =
    await embeddingService.embedDocuments(documents);

  console.log(
    "Number of embeddings:",
    documentEmbeddings.length
  );

  console.log(
    "Embedding dimensions:",
    documentEmbeddings[0]?.length
  );

  const queryEmbedding =
    await embeddingService.embedQuery(
      "How can I manage leads in UniThread?"
    );

  console.log(
    "Query embedding dimensions:",
    queryEmbedding.length
  );

  console.log(
    "First five values:",
    queryEmbedding.slice(0, 5)
  );
}

main().catch((error) => {
  console.error(
    "Cloudflare embedding test failed:",
    error
  );

  process.exit(1);
});