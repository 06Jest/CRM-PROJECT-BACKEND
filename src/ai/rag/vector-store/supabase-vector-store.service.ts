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
    scopeType: "platform" | "organization" | "profile";
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

    if (metadata.scopeType === "platform") {
      if (hasOrganizationId || hasProfileId) {
        throw new Error(
          "Platform RAG documents cannot have an organizationId or profileId."
        );
      }
    }

    if (metadata.scopeType === "organization") {
      if (!hasOrganizationId || hasProfileId) {
        throw new Error(
          "Organization RAG documents require organizationId and cannot have profileId."
        );
      }
    }

    if (metadata.scopeType === "profile") {
      if (!hasProfileId || hasOrganizationId) {
        throw new Error(
          "Profile RAG documents require profileId and cannot have organizationId."
        );
      }
    }

    const organizationId = metadata.organizationId ?? null;
    const profileId = metadata.profileId ?? null;

    /*
     * Find the existing document for this source.
     *
     * A source is uniquely identified by:
     * - source_id
     * - source_type
     * - scope_type
     * - organization_id OR profile_id
     *
     * Platform documents have neither organization_id nor profile_id.
     */
    let documentQuery = supabaseAdmin
      .from("rag_documents")
      .select("id")
      .eq("source_id", metadata.sourceId)
      .eq("source_type", metadata.sourceType)
      .eq("scope_type", metadata.scopeType);

    if (organizationId) {
      documentQuery = documentQuery
        .eq("organization_id", organizationId)
        .is("profile_id", null);
    } else if (profileId) {
      documentQuery = documentQuery
        .eq("profile_id", profileId)
        .is("organization_id", null);
    } else {
      documentQuery = documentQuery
        .is("organization_id", null)
        .is("profile_id", null);
    }

    const {
      data: existingDocument,
      error: existingDocumentError,
    } = await documentQuery.maybeSingle();

    if (existingDocumentError) {
      throw new Error(
        `Failed to find existing RAG document: ${existingDocumentError.message}`
      );
    }

    let documentId: string;

    if (existingDocument) {
      documentId = existingDocument.id;

      const { error: updateDocumentError } = await supabaseAdmin
        .from("rag_documents")
        .update({
          scope_type: metadata.scopeType,
          source_name: metadata.title ?? metadata.sourceId,
          title: metadata.title ?? null,
          metadata: {},
          indexed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", documentId);

      if (updateDocumentError) {
        throw new Error(
          `Failed to update RAG document: ${updateDocumentError.message}`
        );
      }

      // Remove the old chunks before inserting the newly generated chunks.
      const { error: deleteChunksError } = await supabaseAdmin
        .from("rag_chunks")
        .delete()
        .eq("document_id", documentId);

      if (deleteChunksError) {
        throw new Error(
          `Failed to replace existing RAG chunks: ${deleteChunksError.message}`
        );
      }
    } else {
      const { data: storedDocument, error: documentError } =
        await supabaseAdmin
          .from("rag_documents")
          .insert({
            source_id: metadata.sourceId,
            source_type: metadata.sourceType,
            source_name: metadata.title ?? metadata.sourceId,
            scope_type: metadata.scopeType,
            organization_id: organizationId,
            profile_id: profileId,
            title: metadata.title ?? null,
            metadata: {},
            indexed_at: new Date().toISOString(),
          })
          .select("id")
          .single();

      if (documentError) {
        throw new Error(
          `Failed to store RAG document: ${documentError.message}`
        );
      }

      documentId = storedDocument.id;
    }

    const chunkRows = chunks.map((chunk) => ({
      document_id: documentId,
      content: chunk.content,
      chunk_index: chunk.metadata.chunkIndex,
      embedding: chunk.embedding,
      metadata: {
        sourceId: chunk.metadata.sourceId,
        sourceType: chunk.metadata.sourceType,
        scopeType: chunk.metadata.scopeType,
        organizationId: chunk.metadata.organizationId ?? null,
        profileId: chunk.metadata.profileId ?? null,
        title: chunk.metadata.title ?? null,
      },
    }));

    if (chunkRows.length === 0) {
      return documentId;
    }

    const { error: chunksError } = await supabaseAdmin
      .from("rag_chunks")
      .insert(chunkRows);

    if (chunksError) {
      throw new Error(
        `Failed to store RAG chunks: ${chunksError.message}`
      );
    }

    return documentId;
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
      minSimilarity?: number;
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
    const minSimilarity = options?.minSimilarity ?? 0;

    const scopeType = filter?.scopeType;
    const organizationId = filter?.organizationId ?? null;
    const profileId = filter?.profileId ?? null;

    if (!scopeType) {
      throw new Error(
        "Similarity search requires an explicit scopeType."
      );
    }

    if (scopeType === "platform") {
      if (organizationId !== null || profileId !== null) {
        throw new Error(
          "Platform similarity search cannot include organizationId or profileId."
        );
      }
    }

    if (scopeType === "organization") {
      if (organizationId === null || profileId !== null) {
        throw new Error(
          "Organization similarity search requires organizationId and cannot include profileId."
        );
      }
    }

    if (scopeType === "profile") {
      if (profileId === null || organizationId !== null) {
        throw new Error(
          "Profile similarity search requires profileId and cannot include organizationId."
        );
      }
    }

    const { data, error } = await supabaseAdmin.rpc("match_rag_chunks", {
      query_embedding: queryEmbedding,
      match_count: topK,
      filter_scope_type: scopeType,
      filter_organization_id: organizationId,
      filter_profile_id: profileId,
    });

    if (error) {
      throw new Error(
        `Failed to search RAG chunks: ${error.message}`
      );
    }

    const matchedChunks = (data ?? []) as MatchedRagChunk[];

    return matchedChunks
      .filter((chunk) => chunk.similarity >= minSimilarity)
      .map((chunk) => ({
        id: chunk.id,
        content: chunk.content,
        metadata: {
          sourceId: chunk.metadata.sourceId,
          sourceType: chunk.metadata.sourceType,
          scopeType: chunk.metadata.scopeType,
          organizationId:
            chunk.metadata.organizationId ?? undefined,
          profileId: chunk.metadata.profileId ?? undefined,
          title: chunk.metadata.title ?? undefined,
          chunkIndex: chunk.chunk_index,
        },
        embedding: [],
        similarity: chunk.similarity,
      }));
  }
}