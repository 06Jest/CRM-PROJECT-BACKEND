import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import {
  ConversationType,
  MemberData,
} from "./chats.types";

import {
  ensureConversationMemberFromDB,
  getMembershipsFromDB,
  getMembersFromDB,
  markConversationAsReadFromDB,
  getMyReadStatesFromDB,
  addConversationMemberToDB,
  addDefaultConversationMemberToDB,
  getDefaultConversationsFromDB,
} from "./conversation.member.repository";

import {
  createNewConversationToDB,
} from "./conversation.repository";

import { OrganizationType } from "../organizations/organization.types";

export const ensureConversationMember =
  async (
    conversationId: string,
    memberId: string,
    accessToken: string
  ): Promise<void> => {
    return ensureConversationMemberFromDB(
      conversationId,
      memberId,
      accessToken
    );
  };

export const getMembershipsService =
  async (
    memberId: string,
    accessToken: string
  ): Promise<string[]> => {
    return getMembershipsFromDB(
      memberId,
      accessToken
    );
  };

export const getMembersService =
  async (
    conversationIds: string[],
    accessToken: string
  ): Promise<MemberData[]> => {
    return getMembersFromDB(
      conversationIds,
      accessToken
    );
  };

export const markConversationAsReadService =
  async (
    conversationId: string,
    memberId: string,
    accessToken: string
  ) => {
    await ensureConversationMember(
      conversationId,
      memberId,
      accessToken
    );

    const readAt =
      new Date().toISOString();

    return markConversationAsReadFromDB(
      conversationId,
      memberId,
      readAt,
      accessToken
    );
  };

export const getMyReadStatesService =
  async (
    conversationIds: string[],
    memberId: string,
    accessToken: string
  ) => {
    return getMyReadStatesFromDB(
      conversationIds,
      memberId,
      accessToken
    );
  };

export const addConversationMemberService =
  async (
    conversationId: string,
    memberId: string,
    accessToken: string
  ) => {
    return addConversationMemberToDB(
      conversationId,
      memberId,
      accessToken
    );
  };

export const createDefaultConversationsService = async (
  orgId: string,
  memberId: string,
  orgType: string,
  accessToken: string
): Promise<void> => {
  if (orgType === "personal") {
    return;
  }

  if (!memberId) {
    throw new AppError(401, "Not a Member in Organization");
  }

  const conversationTypes = ["organization", "announcement"] as const;

  for (const type of conversationTypes) {
    const conversation = await createNewConversationToDB(
      orgId,
      memberId,
      type
    );

    await addDefaultConversationMemberToDB(
      conversation.id,
      memberId
    );
  }
};

export const joinDefaultConversationsService =
  async (
    orgId: string,
    memberId: string
  ): Promise<void> => {
    if (!memberId) {
      throw new AppError(
        401,
        "Not a Member in Organization"
      );
    }

    const conversations =
      await getDefaultConversationsFromDB(
        orgId
      );

    if (!conversations.length) {
      return;
    }

    for (const conversation of conversations) {
      try {
        await addDefaultConversationMemberToDB(
          conversation.id,
          memberId
        );
      } catch (error: any) {
        if (error?.code === "23505") {
          continue;
        }

        throw error;
      }
    }
  };