import { createSupabaseUserClient } from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import {
  AddMessage,
  MessageListItem,
} from "../../types/chat";

import { ensureConversationMember } from "./conversation.member.service";


const messageTab = table.chat.messages;
const conversationTab = table.chat.conversations;


const senderFkey = "messages_sender_id_fkey";

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



export const getMessagesFromDB = async (
  conversationId: string,
  memberId: string,
  accessToken: string
): Promise<MessageListItem[]> => {


  await ensureConversationMember(
    conversationId,
    memberId,
    accessToken
  );


  const db = createSupabaseUserClient(accessToken);


  const { data, error } = await db
    .from(messageTab)
    .select(all)
    .eq("conversation_id", conversationId)
    .order("created_at", {
      ascending: true,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Messages: ${error.message}`
    );
  }


  return (data ?? []) as MessageListItem[];
};




export const sendMessageToDB = async (
  conversationId: string,
  memberId: string,
  message: AddMessage,
  accessToken: string
): Promise<MessageListItem> => {


  await ensureConversationMember(
    conversationId,
    memberId,
    accessToken
  );


  const db = createSupabaseUserClient(accessToken);



  const { data, error } = await db
    .from(messageTab)
    .insert({
      conversation_id: conversationId,
      sender_id: memberId,
      content: message.content,
      entity_type: message.entity_type ?? null,
      entity_id: message.entity_id ?? null,
    })
    .select(all)
    .single();


  if (error) {
    throw new AppError(
      500,
      `Failed to send Message: ${error.message}`
    );
  }



  const { error: conversationError } =
    await db
      .from(conversationTab)
      .update({
        last_message_id: data.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);



  if (conversationError) {
    throw new AppError(
      500,
      `Failed to update conversation timestamp: ${conversationError.message}`
    );
  }


  return data as MessageListItem;
};





export const editMessageFromDB = async (
  id: string,
  memberId: string,
  content: string,
  accessToken: string
): Promise<MessageListItem> => {


  const db = createSupabaseUserClient(accessToken);



  const { data: existing, error } =
    await db
      .from(messageTab)
      .select(`
        conversation_id,
        sender_id,
        created_at
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single();



  if (error || !existing) {
    throw new AppError(
      404,
      "Message not found."
    );
  }



  await ensureConversationMember(
    existing.conversation_id,
    memberId,
    accessToken
  );



  if (existing.sender_id !== memberId) {
    throw new AppError(
      403,
      "You can only edit your own messages."
    );
  }



  const EDIT_WINDOW_MS = 15 * 60 * 1000;



  if (
    Date.now() -
      new Date(existing.created_at).getTime()
      >
    EDIT_WINDOW_MS
  ) {
    throw new AppError(
      403,
      "Messages can only be edited within 15 minutes."
    );
  }



  const { data, error: updateError } =
    await db
      .from(messageTab)
      .update({
        content,
        edited_at: new Date().toISOString(),
      })
      .eq("id", id)
      .is("deleted_at", null)
      .select(all)
      .single();



  if (updateError || !data) {
    throw new AppError(
      500,
      `Failed to edit Message: ${
        updateError?.message ?? "Unknown error"
      }`
    );
  }



  return data as MessageListItem;
};






export const deleteMessageFromDB = async (
  id: string,
  memberId: string,
  accessToken: string
): Promise<string> => {


  const db = createSupabaseUserClient(accessToken);



  const { data: existing, error } =
    await db
      .from(messageTab)
      .select(`
        conversation_id,
        sender_id
      `)
      .eq("id", id)
      .is("deleted_at", null)
      .single();



  if (error || !existing) {
    throw new AppError(
      404,
      "Message not found."
    );
  }



  await ensureConversationMember(
    existing.conversation_id,
    memberId,
    accessToken
  );



  if (existing.sender_id !== memberId) {
    throw new AppError(
      403,
      "You can only delete your own messages."
    );
  }



  const now = new Date().toISOString();



  const { error: deleteError } =
    await db
      .from(messageTab)
      .update({
        deleted_at: now,
      })
      .eq("id", id)
      .is("deleted_at", null);



  if (deleteError) {
    throw new AppError(
      500,
      `Failed to delete Message: ${deleteError.message}`
    );
  }




  const {
    data: latestMessage,
    error: latestMessageError,
  } =
    await db
      .from(messageTab)
      .select("id")
      .eq(
        "conversation_id",
        existing.conversation_id
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
  } =
    await db
      .from(conversationTab)
      .update({
        last_message_id:
          latestMessage?.id ?? null,
        updated_at: now,
      })
      .eq(
        "id",
        existing.conversation_id
      );



  if (conversationError) {
    throw new AppError(
      500,
      `Failed to update Conversation: ${conversationError.message}`
    );
  }



  return id;
};