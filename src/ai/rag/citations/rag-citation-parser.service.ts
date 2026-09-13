import type { RagContextSource } from "../context/rag-context.types";

export interface RagCitation {
  sourceIndex: number;
  sourceId: string;
  sourceType: string;
  title?: string;
  chunkIndex: number;
  similarity?: number;
}

export class RagCitationParserService {
  parse(
    responseText: string,
    sources: RagContextSource[]
  ): RagCitation[] {
    const citationPattern = /\[Source\s+(\d+)\]/gi;
    const citedIndexes = new Set<number>();

    let match: RegExpExecArray | null;

    while ((match = citationPattern.exec(responseText)) !== null) {
      const sourceIndex = Number(match[1]);

      if (
        Number.isInteger(sourceIndex) &&
        sourceIndex >= 1 &&
        sourceIndex <= sources.length
      ) {
        citedIndexes.add(sourceIndex);
      }
    }

    return Array.from(citedIndexes)
      .sort((a, b) => a - b)
      .map((sourceIndex) => {
        const source = sources[sourceIndex - 1];

        return {
          sourceIndex,
          sourceId: source.sourceId,
          sourceType: source.sourceType,
          ...(source.title !== undefined
            ? { title: source.title }
            : {}),
          chunkIndex: source.chunkIndex,
          ...(source.similarity !== undefined
            ? { similarity: source.similarity }
            : {}),
        };
      });
  }
}

export const ragCitationParserService =
  new RagCitationParserService();