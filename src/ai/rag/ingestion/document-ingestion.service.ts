import { DocumentSplitterService } from "../splitters/document-splitter.service";
import type { EmbeddingService } from "../embeddings/embedding.types";
import { SupabaseVectorStoreService } from "../vector-store/supabase-vector-store.service";
import type { RagDocument } from "../types/rag.types";

export class DocumentIngestionService {
  constructor(
    private readonly documentSplitter: DocumentSplitterService,
    private readonly embeddingService: EmbeddingService,
    private readonly vectorStore: SupabaseVectorStoreService
  ) {}

  async ingestDocument(document: RagDocument): Promise<string> {
    if (!document.content.trim()) {
      throw new Error("Document content cannot be empty.");
    }

    const chunks = await this.documentSplitter.splitDocument(document);

    if (chunks.length === 0) {
      throw new Error("Document produced no chunks.");
    }

    const embeddings = await this.embeddingService.embedDocuments(
      chunks.map((chunk) => chunk.content)
    );

    if (embeddings.length !== chunks.length) {
      throw new Error(
        `Expected ${chunks.length} embeddings, but received ${embeddings.length}.`
      );
    }

    const embeddedChunks = chunks.map((chunk, index) => ({
      content: chunk.content,
      metadata: chunk.metadata,
      embedding: embeddings[index],
    }));

    return this.vectorStore.storeDocument(
      document,
      embeddedChunks
    );
  }
}