import type { RagChunk } from "../types/rag.types";

export interface StoredRagChunk {
  id: string;
  content: string;
  metadata: RagChunk["metadata"];
  embedding: number[];
}

export interface VectorSearchFilter {
  organizationId?: string;
  profileId?: string;
}

export interface VectorStore {
  storeChunks(
    chunks: StoredRagChunk[]
  ): Promise<void>;

  similaritySearch(
    queryEmbedding: number[],
    options?: {
      topK?: number;
      filter?: VectorSearchFilter;
    }
  ): Promise<StoredRagChunk[]>;
}