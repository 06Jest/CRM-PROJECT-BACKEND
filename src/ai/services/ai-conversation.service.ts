import { AppError } from "../../middleware/error.middleware";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";
import { AIMessage } from "../types/ai.types";

const aiConversationTable = table.ai.conversations;
const aiMessageTable = table.ai.messages;

export class AIConversationService {
  constructor(
    private readonly accessToken: string
  ) {}

  private get db() {
    return createSupabaseUserClient(
      this.accessToken
    );
  }

  async getConversation(
    conversationId: string
  ) {
    const { data, error } = await this.db
      .from(aiConversationTable)
      .select("*")
      .eq("id", conversationId)
      .single();

    if (error || !data) {
      throw new AppError(
        404,
        "AI conversation not found"
      );
    }

    return data;
  }

  async getConversations({
    profileId,
    orgId,
  }: {
    profileId: string;
    orgId?: string;
  }) {
    let query = this.db
      .from(aiConversationTable)
      .select(
        "id, profile_id, org_id, agent_id, title, created_at, updated_at"
      )
      .eq("profile_id", profileId);

    if (orgId) {
      query = query.or(
        `org_id.is.null,org_id.eq.${orgId}`
      );
    } else {
      query = query.is("org_id", null);
    }

    const { data, error } = await query
      .order("updated_at", {
        ascending: false,
      });

    if (error) {
      throw new AppError(
        500,
        `Failed to load AI conversations: ${error.message}`
      );
    }

    return data ?? [];
  }

  async createConversation({
    profileId,
    orgId,
    agentId,
    title,
  }: {
    profileId: string;
    orgId?: string;
    agentId: string;
    title?: string;
  }) {
    const { data, error } = await this.db
      .from(aiConversationTable)
      .insert({
        profile_id: profileId,
        org_id: orgId ?? null,
        agent_id: agentId,
        title: title ?? null,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError(
        500,
        `Failed to create AI conversation: ${
          error?.message ?? "Unknown error"
        }`
      );
    }

    return data;
  }

  async createMessage({
    conversationId,
    role,
    content,
  }: {
    conversationId: string;
    role: "user" | "assistant" | "tool";
    content: string;
  }) {
    const { data, error } = await this.db
      .from(aiMessageTable)
      .insert({
        conversation_id: conversationId,
        role,
        content,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError(
        500,
        `Failed to create AI message: ${
          error?.message ?? "Unknown error"
        }`
      );
    }

    return data;
  }

  async updateConversationTitle({
    conversationId,
    title,
  }: {
    conversationId: string;
    title: string;
  }) {
    const { data, error } = await this.db
      .from(aiConversationTable)
      .update({
        title,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId)
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError(
        500,
        `Failed to update AI conversation title: ${
          error?.message ?? "Unknown error"
        }`
      );
    }

    return data;
  }

  async getMessages(
    conversationId: string
  ) {
    const { data, error } = await this.db
      .from(aiMessageTable)
      .select(
        "id, role, content, created_at"
      )
      .eq(
        "conversation_id",
        conversationId
      )
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      throw new AppError(
        500,
        `Failed to load AI messages: ${error.message}`
      );
    }

    return data ?? [];
  }

  async getMessageHistory(
    conversationId: string
  ): Promise<AIMessage[]> {
    const messages =
      await this.getMessages(
        conversationId
      );

    return messages.map((message) => ({
      role: message.role,
      content: message.content,
    }));
  }
}