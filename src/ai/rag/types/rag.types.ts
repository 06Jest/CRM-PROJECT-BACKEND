export interface RagDocumentMetadata {
  sourceId: string;
  sourceType: string;
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