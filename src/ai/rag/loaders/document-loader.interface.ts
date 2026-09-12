import type { RagDocument } from "../types/rag.types";

export interface RagDocumentLoader {
  load(): Promise<RagDocument[]>;
}