import type { RagDocumentLoader } from "../loaders/document-loader.interface";
import { DocumentIngestionService } from "./document-ingestion.service";

export class RagIngestionService {
  constructor(
    private readonly documentIngestionService: DocumentIngestionService
  ) {}

  async ingestFromLoader(
    loader: RagDocumentLoader
  ): Promise<string[]> {
    const documents = await loader.load();

    if (documents.length === 0) {
      return [];
    }

    const documentIds: string[] = [];

    for (const document of documents) {
      const documentId =
        await this.documentIngestionService.ingestDocument(document);

      documentIds.push(documentId);
    }

    return documentIds;
  }
}