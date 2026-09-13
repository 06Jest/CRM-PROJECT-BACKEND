import path from "node:path";

import { MarkdownDirectoryLoader } from "../loaders/markdown-document.loader";
import { RagIngestionService } from "./rag-ingestion.service";

export class KnowledgeBaseIngestionService {
  constructor(
    private readonly ragIngestionService: RagIngestionService
  ) {}

  async ingestPlatformKnowledge(): Promise<string[]> {
    const knowledgeRoot = path.resolve(
      process.cwd(),
      "src/ai/rag/knowledge"
    );

    const platformDirectory = path.join(knowledgeRoot, "platform");
    const legalDirectory = path.join(knowledgeRoot, "legal");
    const developerDirectory = path.join(knowledgeRoot, "developer");

    const platformLoader = new MarkdownDirectoryLoader(
      platformDirectory,
      {
        sourceType: "knowledge",
        scopeType: "platform",
        sourceIdPrefix: "platform",
      }
    );

    const legalLoader = new MarkdownDirectoryLoader(
      legalDirectory,
      {
        sourceType: "legal",
        scopeType: "platform",
        sourceIdPrefix: "legal",
      }
    );

    const developerLoader = new MarkdownDirectoryLoader(
      developerDirectory,
      {
        sourceType: "developer",
        scopeType: "platform",
        sourceIdPrefix: "developer",
      }
    );

    const platformDocumentIds =
      await this.ragIngestionService.ingestFromLoader(platformLoader);

    const legalDocumentIds =
      await this.ragIngestionService.ingestFromLoader(legalLoader);

    const developerDocumentIds =
      await this.ragIngestionService.ingestFromLoader(developerLoader);

    return [
      ...platformDocumentIds,
      ...legalDocumentIds,
      ...developerDocumentIds,
    ];
  }
}