import { RagRetrievalService } from "../retrieval/rag-retrieval.service";
import { RagContextBuilderService } from "../context/rag-context-builder.service";
import { RagPromptBuilderService } from "../context/rag-prompt-builder.service";
import type {
  RagContext,
  RagContextSource,
} from "../context/rag-context.types";

export interface PrepareRagContextOptions {
  query: string;
  organizationId?: string;
  profileId?: string;
  topK?: number;
  minSimilarity?: number;
}

export interface PreparedRagContext {
  context: RagContext;
  referenceSection: string;
}

export class RagContextService {
  constructor(
    private readonly retrievalService: RagRetrievalService,
    private readonly contextBuilder: RagContextBuilderService,
    private readonly promptBuilder: RagPromptBuilderService
  ) {}

  async prepare(
    options: PrepareRagContextOptions
  ): Promise<PreparedRagContext> {
    const hasOrganizationId = Boolean(options.organizationId);
    const hasProfileId = Boolean(options.profileId);

    if (hasOrganizationId === hasProfileId) {
      throw new Error(
        "RAG context requires exactly one organizationId or profileId."
      );
    }

    const chunks = await this.retrievalService.retrieve(options.query, {
      topK: options.topK ?? 5,
      minSimilarity: options.minSimilarity ?? 0.7,
      filter: {
        ...(options.organizationId
          ? { organizationId: options.organizationId }
          : {}),
        ...(options.profileId
          ? { profileId: options.profileId }
          : {}),
      },
    });

    const context = this.contextBuilder.build(chunks);
    const referenceSection =
      this.promptBuilder.buildReferenceSection(context);

    return {
      context,
      referenceSection,
    };
  }
}