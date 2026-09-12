import type { EmbeddingService } from "./embedding.types";
import { config } from "../../../config/environment";

interface CloudflareEmbeddingResponse {
  success: boolean;
  errors: unknown[];
  messages: unknown[];
  result?: {
    shape?: number[];
    data?: number[][];
  };
}

export class CloudflareEmbeddingService implements EmbeddingService {
  private readonly model = "@cf/baai/bge-small-en-v1.5";

  private readonly accountId: string;
  private readonly apiToken: string;

  constructor() {
    const accountId = config.AI.providers.cloudflare.accountId;
    const apiToken = config.AI.providers.cloudflare.apiToken;

    if (!accountId) {
      throw new Error(
        "Cloudflare account ID is not configured."
      );
    }

    if (!apiToken) {
      throw new Error(
        "Cloudflare API token is not configured."
      );
    }

    this.accountId = accountId;
    this.apiToken = apiToken;
  }

  async embedDocuments(
    texts: string[]
  ): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    if (texts.some((text) => !text.trim())) {
      throw new Error(
        "Embedding documents cannot contain empty text."
      );
    }

    return this.requestEmbeddings(texts);
  }

  async embedQuery(text: string): Promise<number[]> {
    if (!text.trim()) {
      throw new Error(
        "Embedding query cannot be empty."
      );
    }

    const [embedding] = await this.requestEmbeddings([
      text,
    ]);

    if (!embedding) {
      throw new Error(
        "Cloudflare returned no embedding for the query."
      );
    }

    return embedding;
  }

  private async requestEmbeddings(
    texts: string[]
  ): Promise<number[][]> {
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/ai/run/${this.model}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: texts,
        }),
      }
    );

    const responseText = await response.text();

    if (!response.ok) {
      throw new Error(
        `Cloudflare embedding request failed (${response.status}): ${responseText}`
      );
    }

    let data: CloudflareEmbeddingResponse;

    try {
      data = JSON.parse(responseText) as CloudflareEmbeddingResponse;
    } catch {
      throw new Error(
        "Cloudflare embedding response was not valid JSON."
      );
    }

    if (!data.success) {
      throw new Error(
        `Cloudflare embedding request was unsuccessful: ${JSON.stringify(
          data.errors
        )}`
      );
    }

    const embeddings = data.result?.data;

    if (!embeddings?.length) {
      throw new Error(
        "Cloudflare returned no embeddings."
      );
    }

    if (embeddings.length !== texts.length) {
      throw new Error(
        `Cloudflare returned ${embeddings.length} embeddings for ${texts.length} inputs.`
      );
    }

    return embeddings;
  }
}