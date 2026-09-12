import { CloudflareEmbeddingService } from "./embeddings/cloudflare-embedding.service";
import { RagContextBuilderService } from "./context/rag-context-builder.service";
import { RagPromptBuilderService } from "./context/rag-prompt-builder.service";
import { RagContextService } from "./services/rag-context.service";
import { RagRetrievalService } from "./retrieval/rag-retrieval.service";
import { SupabaseVectorStoreService } from "./vector-store/supabase-vector-store.service";

const embeddingService = new CloudflareEmbeddingService();
const vectorStore = new SupabaseVectorStoreService();

const retrievalService = new RagRetrievalService(
  embeddingService,
  vectorStore
);

const contextBuilder = new RagContextBuilderService();
const promptBuilder = new RagPromptBuilderService();

export const ragContextService = new RagContextService(
  retrievalService,
  contextBuilder,
  promptBuilder
);