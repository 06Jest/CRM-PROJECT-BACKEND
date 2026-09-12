import type { RagDocument } from "../types/rag.types";
import type { RagDocumentLoader } from "./document-loader.interface";

export class StaticDocumentLoader implements RagDocumentLoader {
  constructor(private readonly document: RagDocument) {}

  async load(): Promise<RagDocument[]> {
    return [this.document];
  }
}