import { DocumentSplitterService } from "../splitters/document-splitter.service";
import type { RagChunk, RagDocument } from "../types/rag.types";

export class DocumentIngestionService {
  constructor(
    private readonly documentSplitter: DocumentSplitterService
  ) {}

  async ingestDocument(document: RagDocument): Promise<RagChunk[]> {
    if (!document.content.trim()) {
      throw new Error("Document content cannot be empty.");
    }

    return this.documentSplitter.splitDocument(document);
  }
}