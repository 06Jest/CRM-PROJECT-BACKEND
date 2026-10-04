import { createSupabaseUserClient } from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import {
  AddMessage,
  MessageListItem,
} from "./chats.types";

const messageTab =
  table.chat.messages;

const conversationTab =
  table.chat.conversations;

const senderFkey =
  "messages_sender_id_fkey";

const all = `
  *,
  sender:organization_members!${senderFkey}(
    id,
    profile:profiles(
      id,
      first_name,
      last_name,
      avatar_url
    )
  )
`;

export const getMessagesFromDB =
  async (
    conversationId: string,
    accessToken: string
  ): Promise<MessageListItem[]> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from(messageTab)
      .select(all)
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
        `Failed to fetch Messages: ${error.message}`
      );
    }

    return (data ??
      []) as MessageListItem[];
  };

export const sendMessageToDB =
  async (
    conversationId: string,
    memberId: string,
    message: AddMessage,
    accessToken: string
  ): Promise<MessageListItem> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from(messageTab)
      .insert({
        conversation_id:
          conversationId,
        sender_id: memberId,
        content: message.content,
        entity_type:
          message.entity_type ?? null,
        entity_id:
          message.entity_id ?? null,
      })
      .select(all)
      .single();

    if (error) {
      throw new AppError(
        500,
        `Failed to send Message: ${error.message}`
      );
    }

    return data as MessageListItem;
  };

export const getMessageForEditFromDB =
  async (
    id: string,
    accessToken: string
  ) => {
    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from(messageTab)
      .select(`
        conversation_id,
        sender_id,
        created_at
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single();

    if (error || !data) {
      throw new AppError(
        404,
        "Message not found."
      );
    }

    return data;
  };

export const updateMessageContentFromDB =
  async (
    id: string,
    content: string,
    accessToken: string
  ): Promise<MessageListItem> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } =
      await db
        .from(messageTab)
        .update({
          content,
          edited_at:
            new Date().toISOString(),
        })
        .eq("id", id)
        .is("deleted_at", null)
        .select(all)
        .single();

    if (error || !data) {
      throw new AppError(
        500,
        `Failed to edit Message: ${
          error?.message ?? "Unknown error"
        }`
      );
    }

    return data as MessageListItem;
  };

export const deleteMessageFromDB =
  async (
    id: string,
    conversationId: string,
    accessToken: string
  ): Promise<MessageListItem> => {
    const db =
      createSupabaseUserClient(accessToken);

    const now =
      new Date().toISOString();

    const {
      data: deletedMessage,
      error: deleteError,
    } = await db
      .from(messageTab)
      .update({
        deleted_at: now,
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select(all)
      .single();

    if (
      deleteError ||
      !deletedMessage
    ) {
      throw new AppError(
        500,
        `Failed to delete Message: ${
          deleteError?.message ??
          "Message could not be deleted."
        }`
      );
    }

    const {
      data: latestMessage,
      error: latestMessageError,
    } = await db
      .from(messageTab)
      .select("id")
      .eq(
        "conversation_id",
        conversationId
      )
      .is("deleted_at", null)
      .order("created_at", {
        ascending: false,
      })
      .limit(1)
      .maybeSingle();

    if (latestMessageError) {
      throw new AppError(
        500,
        `Failed to fetch latest message: ${latestMessageError.message}`
      );
    }

    const {
      error: conversationError,
    } = await db
      .from(conversationTab)
      .update({
        last_message_id:
          latestMessage?.id ?? null,
        updated_at: now,
      })
      .eq("id", conversationId);

    if (conversationError) {
      throw new AppError(
        500,
        `Failed to update Conversation: ${conversationError.message}`
      );
    }

    return deletedMessage as MessageListItem;
  };