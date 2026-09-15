  import { AppError } from "../../middleware/error.middleware";
  import {
    AIModelReference,
    AIModelRequest,
  } from "../types/ai.types";
  import { ModelRouter } from "../router/model.router";

  export class AIGenerationService {
    constructor(
      private readonly modelRouter: ModelRouter
    ) {}

    async generateConversationTitle(
      message: string
    ): Promise<string> {
      const normalizedMessage = message.trim();

      if (!normalizedMessage) {
        throw new AppError(
          400,
          "Message is required to generate a conversation title"
        );
      }

      const modelReference: AIModelReference = {
        id: "gemini-3.6-flash",
        provider: "gemini",
      };

      const request: AIModelRequest = {
        systemPrompt: `
  You generate concise titles for AI conversations.

  Your task is to identify the user's primary topic, question, or intent.

  Rules:
  - Return only the title.
  - Use a maximum of 6 words.
  - Do not use quotation marks.
  - Do not add a period or other punctuation at the end.
  - Focus on the main question, problem, or requested task.
  - Do not simply copy the opening sentence or introductory context.
  - If the message contains background information followed by a question, prioritize the question.
  - Ignore unnecessary implementation details, technology lists, and personal context unless they are the main topic.
  - Do not answer the user's question.
  - Do not include words like "Conversation", "Chat", or "Question".
  `.trim(),
        messages: [
          {
            role: "user",
            content: normalizedMessage,
          },
        ],
        temperature: 0.3,
        maxTokens: 20,
      };

      try {
        // ModelRouter handles the configured fallback chain.
        const response = await this.modelRouter.generate(
          modelReference,
          request
        );

        const title = response.content
          .trim()
          .replace(/^["']|["']$/g, "")
          .replace(/[.!?]+$/, "")
          .trim();

        return title
          ? title.slice(0, 100)
          : this.createFallbackTitle(normalizedMessage);
      } catch (error) {
        console.error(
          "All AI models failed for conversation title generation. Using local fallback:",
          error
        );

        return this.createFallbackTitle(normalizedMessage);
      }
    }

    private createFallbackTitle(message: string): string {
      const normalizedMessage = message.trim().replace(/\s+/g, " ");

      if (!normalizedMessage) {
        return "New conversation";
      }

      const words = normalizedMessage
        .split(" ")
        .slice(0, 6);

      const title = words.join(" ");

      return title.length > 100
        ? `${title.slice(0, 97)}...`
        : title;
    }
  }