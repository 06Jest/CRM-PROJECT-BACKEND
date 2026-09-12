export interface RagContextSource {
  sourceId: string;
  sourceType: string;
  title?: string;
  chunkIndex: number;
  similarity?: number;
}

export interface RagContext {
  text: string;
  sources: RagContextSource[];
}