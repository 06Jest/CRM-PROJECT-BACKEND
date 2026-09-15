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
    sources: RagContextSource[],
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

    const uniqueCitations = new Map<string, RagCitation>();

    Array.from(citedIndexes)
      .sort((a, b) => a - b)
      .forEach((sourceIndex) => {
        const source = sources[sourceIndex - 1];

        const citation: RagCitation = {
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

        // Deduplicate citations referring to the same source.
        if (!uniqueCitations.has(citation.sourceId)) {
          uniqueCitations.set(citation.sourceId, citation);
        }
      });

    return Array.from(uniqueCitations.values());
  }

  cleanResponseText(responseText: string): string {
    return responseText
      .replace(/\[Source\s+\d+\]/gi, "")
      .replace(/\[Sources?\s*:\s*[^\]]+\]/gi, "")
      .replace(/\[Citation\s+\d+\]/gi, "")
      .replace(/\[Document\s+\d+\]/gi, "")
      .replace(/[ \t]{2,}/g, " ")
      .replace(/ +([.,!?;:])/g, "$1")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
}

export const ragCitationParserService =
  new RagCitationParserService();