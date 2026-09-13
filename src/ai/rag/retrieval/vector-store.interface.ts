import type {
  RagDocument,
  RagDocumentMetadata,
  RagScopeType,
} from "../types/rag.types";

export interface StoredRagChunk {
  id: string;
  content: string;
  metadata: RagDocumentMetadata & {
    chunkIndex: number;
  };
  embedding: number[];
  similarity?: number;
}

export interface VectorSearchFilter {
  scopeType: RagScopeType;
  organizationId?: string;
  profileId?: string;
}

export interface VectorStore {
  storeDocument(
    document: RagDocument,
    chunks: Array<{
      content: string;
      metadata: RagDocumentMetadata & {
        chunkIndex: number;
      };
      embedding: number[];
    }>
  ): Promise<string>;

  storeChunks(chunks: StoredRagChunk[]): Promise<void>;

  similaritySearch(
    queryEmbedding: number[],
    options?: {
      topK?: number;
      minSimilarity?: number;
      filter?: VectorSearchFilter;
    }
  ): Promise<StoredRagChunk[]>;
}