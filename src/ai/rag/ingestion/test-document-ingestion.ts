import { DocumentIngestionService } from "./document-ingestion.service";
import { DocumentSplitterService } from "../splitters/document-splitter.service";
import { CloudflareEmbeddingService } from "../embeddings/cloudflare-embedding.service";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";

const documentSplitter = new DocumentSplitterService();
const embeddingService = new CloudflareEmbeddingService();
const vectorStore = new SupabaseVectorStoreService();

const ingestionService = new DocumentIngestionService(
  documentSplitter,
  embeddingService,
  vectorStore
);

const testProfileId = process.env.TEST_PROFILE_ID;

if (!testProfileId) {
  throw new Error("TEST_PROFILE_ID is not configured.");
}

const testDocument = {
  content: `
    uniThread is a customer relationship management platform.

    It helps users manage contacts, leads, deals, tasks, notes, and customer
    interactions in one place.

    This document exists only to verify the RAG ingestion pipeline.
  `,
  metadata: {
    sourceId: "rag-ingestion-test-001",
    sourceType: "test",
    profileId: testProfileId,
    title: "RAG Ingestion Test Document",
  },
};

const run = async () => {
  const documentId = await ingestionService.ingestDocument(testDocument);

  console.log("RAG document stored successfully.");
  console.log("Document ID:", documentId);
};

run().catch((error) => {
  console.error("RAG ingestion test failed:", error);
  process.exitCode = 1;
});