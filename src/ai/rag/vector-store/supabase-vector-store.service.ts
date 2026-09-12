import { supabaseAdmin } from "../../../config/supabase";
import type {
  RagDocument,
  RagDocumentMetadata,
} from "../types/rag.types";
import type {
  StoredRagChunk,
  VectorSearchFilter,
  VectorStore,
} from "../retrieval/vector-store.interface";
interface EmbeddedRagChunk {
  content: string;
  metadata: RagDocumentMetadata & {
    chunkIndex: number;
  };
  embedding: number[];
}

interface MatchedRagChunk {
  id: string;
  document_id: string;
  content: string;
  chunk_index: number;
  metadata: {
    sourceId: string;
    sourceType: string;
    organizationId?: string | null;
    profileId?: string | null;
    title?: string | null;
  };
  similarity: number;
}

export class SupabaseVectorStoreService implements VectorStore {
  async storeDocument(
    document: RagDocument,
    chunks: EmbeddedRagChunk[]
  ): Promise<string> {
    const { metadata } = document;

    const hasOrganizationId = Boolean(metadata.organizationId);
    const hasProfileId = Boolean(metadata.profileId);

    if (hasOrganizationId === hasProfileId) {
      throw new Error(
        "A RAG document must belong to exactly one organization or profile."
      );
    }

    const { data: storedDocument, error: documentError } = await supabaseAdmin
      .from("rag_documents")
      .insert({
        source_id: metadata.sourceId,
        source_type: metadata.sourceType,
        source_name: metadata.title ?? metadata.sourceId,
        organization_id: metadata.organizationId ?? null,
        profile_id: metadata.profileId ?? null,
        title: metadata.title ?? null,
        metadata: {},
      })
      .select("id")
      .single();

    if (documentError) {
      throw new Error(
        `Failed to store RAG document: ${documentError.message}`
      );
    }

    const chunkRows = chunks.map((chunk) => ({
      document_id: storedDocument.id,
      content: chunk.content,
      chunk_index: chunk.metadata.chunkIndex,
      embedding: chunk.embedding,
      metadata: {
        sourceId: chunk.metadata.sourceId,
        sourceType: chunk.metadata.sourceType,
        organizationId: chunk.metadata.organizationId ?? null,
        profileId: chunk.metadata.profileId ?? null,
        title: chunk.metadata.title ?? null,
      },
    }));

    if (chunkRows.length === 0) {
      return storedDocument.id;
    }

    const { error: chunksError } = await supabaseAdmin
      .from("rag_chunks")
      .insert(chunkRows);

    if (chunksError) {
      // Prevent leaving an orphaned document if chunk insertion fails.
      await supabaseAdmin
        .from("rag_documents")
        .delete()
        .eq("id", storedDocument.id);

      throw new Error(
        `Failed to store RAG chunks: ${chunksError.message}`
      );
    }

    return storedDocument.id;
  }

  async storeChunks(chunks: StoredRagChunk[]): Promise<void> {
    if (chunks.length === 0) {
      return;
    }

    throw new Error(
      "storeChunks is not implemented yet. Use storeDocument() so chunks remain associated with a RAG document."
    );
  }

  async similaritySearch(
    queryEmbedding: number[],
    options?: {
      topK?: number;
      filter?: VectorSearchFilter;
    }
  ): Promise<StoredRagChunk[]> {
    if (queryEmbedding.length !== 384) {
      throw new Error(
        `Expected a 384-dimensional query embedding, received ${queryEmbedding.length}.`
      );
    }

    const topK = Math.min(Math.max(options?.topK ?? 5, 1), 50);
    const filter = options?.filter;

    const organizationId = filter?.organizationId ?? null;
    const profileId = filter?.profileId ?? null;

    if (
      (organizationId === null && profileId === null) ||
      (organizationId !== null && profileId !== null)
    ) {
      throw new Error(
        "Similarity search requires exactly one organizationId or profileId."
      );
    }

    const { data, error } = await supabaseAdmin.rpc("match_rag_chunks", {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_organization_id: organizationId,
      filter_profile_id: profileId,
    });

    if (error) {
      throw new Error(
        `Failed to search RAG chunks: ${error.message}`
      );
    }

    const matchedChunks = (data ?? []) as MatchedRagChunk[];

    return matchedChunks.map((chunk) => ({
      id: chunk.id,
      content: chunk.content,
      metadata: {
        sourceId: chunk.metadata.sourceId,
        sourceType: chunk.metadata.sourceType,
        organizationId: chunk.metadata.organizationId ?? undefined,
        profileId: chunk.metadata.profileId ?? undefined,
        title: chunk.metadata.title ?? undefined,
        chunkIndex: chunk.chunk_index,
      },
      embedding: [],
    }));
  }
}