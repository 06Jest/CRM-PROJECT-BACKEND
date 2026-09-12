import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import type { EmbeddingService } from "./embedding.types";

export class GeminiEmbeddingService implements EmbeddingService {
  private readonly embeddings: GoogleGenerativeAIEmbeddings;

  constructor() {
    this.embeddings = new GoogleGenerativeAIEmbeddings({
      apiKey: process.env.GEMINI_API_KEY,
      model: "gemini-embedding-001",
    });
  }

  async embedDocuments(texts: string[]): Promise<number[][]> {
    return this.embeddings.embedDocuments(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    return this.embeddings.embedQuery(text);
  }
}