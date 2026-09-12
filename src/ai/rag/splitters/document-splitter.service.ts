import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { ragConfig } from "../config/rag.config";
import type { RagChunk, RagDocument } from "../types/rag.types";

export class DocumentSplitterService {
  private readonly splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: ragConfig.chunkSize,
      chunkOverlap: ragConfig.chunkOverlap,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });
  }

  async splitDocument(document: RagDocument): Promise<RagChunk[]> {
    const documents = await this.splitter.createDocuments(
      [document.content],
      [document.metadata]
    );

    return documents.map((chunk, index) => ({
      content: chunk.pageContent,
      metadata: {
        ...document.metadata,
        chunkIndex: index,
      },
    }));
  }
}