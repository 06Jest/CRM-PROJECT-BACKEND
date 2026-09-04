import { AppError } from "../../middleware/error.middleware";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";
import { AIPendingConfirmation } from "../types/ai.types";

const aiConfirmationTable = table.ai.confirmations;

export class AIConfirmationService {
  constructor(
    private readonly accessToken: string
  ) {}

  private get db() {
    return createSupabaseUserClient(
      this.accessToken
    );
  }

  async create(
    confirmation: AIPendingConfirmation
  ): Promise<AIPendingConfirmation> {
    const { data, error } = await this.db
      .from(aiConfirmationTable)
      .insert({
        id: confirmation.confirmationId,
        profile_id: confirmation.profileId,
        org_id: confirmation.orgId ?? null,
        conversation_id:
          confirmation.conversationId ?? null,
        agent_id: confirmation.agentId,
        tool_name: confirmation.toolCall.name,
        tool_call_id: confirmation.toolCall.id,
        tool_arguments: confirmation.toolCall.arguments,
        expires_at: confirmation.expiresAt,
      })
      .select("*")
      .single();

    if (error || !data) {
      throw new AppError(
        500,
        `Failed to create AI confirmation: ${
          error?.message ?? "Unknown error"
        }`
      );
    }

    return {
      confirmationId: data.id,
      profileId: data.profile_id,
      ...(data.org_id
        ? { orgId: data.org_id }
        : {}),
      ...(data.conversation_id
        ? {
            conversationId:
              data.conversation_id,
          }
        : {}),
      agentId: data.agent_id,
      toolCall: {
        id: data.tool_call_id,
        name: data.tool_name,
        arguments: data.tool_arguments,
      },
      expiresAt: data.expires_at,
    };
  }

  async get(
  confirmationId: string,
  profileId: string,
  orgId?: string
): Promise<AIPendingConfirmation | null> {
  let query = this.db
  .from(aiConfirmationTable)
  .select("*")
  .eq("id", confirmationId)
  .eq("profile_id", profileId);

  if (orgId) {
    query = query.eq("org_id", orgId);
  } else {
    query = query.is("org_id", null);
  }

  const { data, error } 
    = await query.maybeSingle();

    if (error) {
      throw new AppError(
        500,
        `Failed to retrieve AI confirmation: ${error.message}`
      );
    }

    if (!data) {
      return null;
    }

    if (
      new Date(data.expires_at).getTime() <=
      Date.now()
    ) {
      await this.delete(confirmationId);
      return null;
    }

    return {
      confirmationId: data.id,
      profileId: data.profile_id,
      ...(data.org_id
        ? { orgId: data.org_id }
        : {}),
      ...(data.conversation_id
        ? {
            conversationId:
              data.conversation_id,
          }
        : {}),
      agentId: data.agent_id,
      toolCall: {
        id: data.tool_call_id,
        name: data.tool_name,
        arguments: data.tool_arguments,
      },
      expiresAt: data.expires_at,
    };
  }

  async delete(
    confirmationId: string
  ): Promise<void> {
    const { error } = await this.db
      .from(aiConfirmationTable)
      .delete()
      .eq("id", confirmationId);

    if (error) {
      throw new AppError(
        500,
        `Failed to delete AI confirmation: ${error.message}`
      );
    }
  }
}