import type { StoredRagChunk } from "../retrieval/vector-store.interface";
import { RagContext } from "./rag-context.types";


export class RagContextBuilderService {
  build(chunks: StoredRagChunk[]): RagContext {
    const validChunks = chunks.filter(
      (chunk) => chunk.content.trim().length > 0
    );

    const text = validChunks
      .map((chunk, index) => {
        const title = chunk.metadata.title ?? "Untitled source";

        return [
          `[Source ${index + 1}]`,
          `Title: ${title}`,
          `Source type: ${chunk.metadata.sourceType}`,
          `Content:`,
          chunk.content,
        ].join("\n");
      })
      .join("\n\n---\n\n");

    const sources = validChunks.map((chunk) => ({
      sourceId: chunk.metadata.sourceId,
      sourceType: chunk.metadata.sourceType,
      title: chunk.metadata.title,
      chunkIndex: chunk.metadata.chunkIndex,
      similarity: chunk.similarity,
    }));

    return {
      text,
      sources,
    };
  }
}