export type RagScopeType = "platform" | "organization" | "profile";

export interface RagDocumentMetadata {
  sourceId: string;
  sourceType: string;
  scopeType: RagScopeType;
  organizationId?: string;
  profileId?: string;
  title?: string;
}

export interface RagDocument {
  content: string;
  metadata: RagDocumentMetadata;
}

export interface RagChunk {
  content: string;
  metadata: RagDocumentMetadata & {
    chunkIndex: number;
  };
}