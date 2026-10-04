import {
  createSupabaseUserClient,
  supabaseAdmin,
} from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import {
  ConversationType,
  ConversationWithLastMessage,
} from "./chats.types";

const conversationTab = table.chat.conversations;

const lastMessageFkey =
  "conversations_last_message_id_fkey";

const all = `
  *,
  last_message:messages!${lastMessageFkey}(
    id,
    content,
    created_at,
    sender:organization_members!messages_sender_id_fkey(
      id,
      profile:profiles!organization_members_profile_fkey(
        id,
        first_name,
        last_name,
        avatar_url
      )
    )
  )
`;

export const getConversationByIDFromDB = async (
  orgId: string,
  conversationID: string,
  accessToken: string
): Promise<ConversationWithLastMessage> => {
  const db =
    createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(conversationTab)
    .select(all)
    .eq("id", conversationID)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Conversations: ${error.message}`
    );
  }

  return data;
};

export const getConversationsByIDsFromDB =
  async (
    orgId: string,
    conversationIds: string[],
    accessToken: string
  ): Promise<ConversationWithLastMessage[]> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from(conversationTab)
      .select(all)
      .in("id", conversationIds)
      .eq("org_id", orgId)
      .is("deleted_at", null);

    if (error) {
      throw new AppError(
        500,
        `Failed to fetch Conversations: ${error.message}`
      );
    }

    return data ?? [];
  };

export const createNewConversationToDB =
  async (
    orgId: string,
    memberId: string,
    type: ConversationType
  ): Promise<ConversationWithLastMessage> => {
    const db = supabaseAdmin;

    const { data, error } = await db
      .from(conversationTab)
      .insert({
        org_id: orgId,
        created_by: memberId,
        type,
      })
      .select(all)
      .single();

    if (error || !data) {
      throw new AppError(
        500,
        `Failed to create conversation: ${
          error?.message ?? "Unknown error"
        }`
      );
    }

    return data;
  };

export const getActiveMemberFromDB = async (
  orgId: string,
  memberId: string
) => {
  const { data, error } = await supabaseAdmin
    .from("organization_members")
    .select(`
      id,
      profile:profiles!organization_members_profile_fkey(
        id,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq("id", memberId)
    .eq("org_id", orgId)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    throw new AppError(
      500,
      `Failed to verify member: ${error.message}`
    );
  }

  return data;
};