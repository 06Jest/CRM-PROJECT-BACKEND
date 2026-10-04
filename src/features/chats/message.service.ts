import { AppError } from "../../middleware/error.middleware";

import {
  AddMessage,
  MessageListItem,
} from "./chats.types";

import {
  getMessagesFromDB,
  sendMessageToDB,
  getMessageForEditFromDB,
  updateMessageContentFromDB,
  deleteMessageFromDB,
} from "./message.repository";

import {
  ensureConversationMember,
} from "./conversation.member.service";

export const getMessagesService =
  async (
    conversationId: string,
    memberId: string,
    accessToken: string
  ): Promise<MessageListItem[]> => {
    await ensureConversationMember(
      conversationId,
      memberId,
      accessToken
    );

    return getMessagesFromDB(
      conversationId,
      accessToken
    );
  };

export const sendMessageService =
  async (
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

    return sendMessageToDB(
      conversationId,
      memberId,
      message,
      accessToken
    );
  };

export const editMessageService =
  async (
    id: string,
    memberId: string,
    content: string,
    accessToken: string
  ): Promise<MessageListItem> => {
    const existing =
      await getMessageForEditFromDB(
        id,
        accessToken
      );

    await ensureConversationMember(
      existing.conversation_id,
      memberId,
      accessToken
    );

    if (
      existing.sender_id !== memberId
    ) {
      throw new AppError(
        403,
        "You can only edit your own messages."
      );
    }

    const EDIT_WINDOW_MS =
      15 * 60 * 1000;

    if (
      Date.now() -
        new Date(
          existing.created_at
        ).getTime() >
      EDIT_WINDOW_MS
    ) {
      throw new AppError(
        403,
        "Messages can only be edited within 15 minutes."
      );
    }

    return updateMessageContentFromDB(
      id,
      content,
      accessToken
    );
  };

export const deleteMessageService =
  async (
    id: string,
    memberId: string,
    accessToken: string
  ): Promise<MessageListItem> => {
    const existing =
      await getMessageForEditFromDB(
        id,
        accessToken
      );

    await ensureConversationMember(
      existing.conversation_id,
      memberId,
      accessToken
    );

    if (
      existing.sender_id !== memberId
    ) {
      throw new AppError(
        403,
        "You can only delete your own messages."
      );
    }

    const DELETE_WINDOW_MS =
      15 * 60 * 1000;

    if (
      Date.now() -
        new Date(
          existing.created_at
        ).getTime() >
      DELETE_WINDOW_MS
    ) {
      throw new AppError(
        403,
        "Messages can only be deleted within 15 minutes."
      );
    }

    return deleteMessageFromDB(
      id,
      existing.conversation_id,
      accessToken
    );
  };