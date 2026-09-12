import type { EmbeddingService } from "../embeddings/embedding.types";
import { ragConfig } from "../config/rag.config";
import type {
  StoredRagChunk,
  VectorSearchFilter,
  VectorStore,
} from "./vector-store.interface";

export interface RagRetrievalOptions {
  topK?: number;
  filter: VectorSearchFilter;
}

export class RagRetrievalService {
  constructor(
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: VectorStore
  ) {}

  async retrieve(
    query: string,
    options: RagRetrievalOptions
  ): Promise<StoredRagChunk[]> {
    const normalizedQuery = query.trim();

    if (!normalizedQuery) {
      throw new Error("RAG retrieval query cannot be empty.");
    }

    const queryEmbedding = await this.embeddingService.embedQuery(
      normalizedQuery
    );

    return this.vectorStore.similaritySearch(queryEmbedding, {
      topK: options.topK ?? ragConfig.topK,
      filter: options.filter,
    });
  }
}