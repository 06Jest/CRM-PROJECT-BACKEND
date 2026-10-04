import { AppError } from "../../middleware/error.middleware";

import {
  ConversationListItem,
  ConversationType,
  ConversationWithLastMessage,
  UserConversationData,
} from "./chats.types";

import {
  getConversationByIDFromDB,
  getConversationsByIDsFromDB,
  createNewConversationToDB,
  getActiveMemberFromDB,
} from "./conversation.repository";

import {
  getMembershipsFromDB,
  getMembersFromDB,
  getMyReadStatesFromDB,
  addMemberInConversationToDB,
} from "./conversation.member.repository";

export const getUserConversationDataService =
  async (
    orgId: string,
    memberId: string,
    accessToken: string
  ): Promise<UserConversationData> => {
    const conversationIds =
      await getMembershipsFromDB(
        memberId,
        accessToken
      );

    if (!conversationIds.length) {
      return {
        conversations: [],
        members: [],
      };
    }

    const [
      conversations,
      members,
    ] = await Promise.all([
      getConversationsByIDsFromDB(
        orgId,
        conversationIds,
        accessToken
      ),
      getMembersFromDB(
        conversationIds,
        accessToken
      ),
    ]);

    return {
      conversations,
      members,
    };
  };

export const getConversationByIDService =
  async (
    orgId: string,
    conversationID: string,
    accessToken: string
  ): Promise<ConversationWithLastMessage> => {
    return getConversationByIDFromDB(
      orgId,
      conversationID,
      accessToken
    );
  };

export const getUserConversationListItemsService =
  async (
    orgId: string,
    memberId: string,
    accessToken: string
  ): Promise<ConversationListItem[]> => {
    const {
      conversations,
      members,
    } = await getUserConversationDataService(
      orgId,
      memberId,
      accessToken
    );

    if (!conversations.length) {
      return [];
    }

    const readStates =
      await getMyReadStatesFromDB(
        conversations.map(
          (conversation) => conversation.id
        ),
        memberId,
        accessToken
      );

    const participantMap = new Map<
      string,
      ConversationListItem["other_participant"]
    >();

    for (const member of members) {
      const participants = Array.isArray(
        member.member
      )
        ? member.member
        : [member.member];

      for (const participant of participants) {
        if (
          !participant ||
          participant.id === memberId
        ) {
          continue;
        }

        participantMap.set(
          member.conversation_id,
          {
            id: participant.id,
            profile: {
              id: participant.profile.id,
              first_name:
                participant.profile.first_name,
              last_name:
                participant.profile.last_name,
              avatar_url:
                participant.profile.avatar_url ??
                null,
            },
          }
        );
      }
    }

    return conversations.map(
      (conversation) => ({
        ...conversation,
        other_participant:
          conversation.type === "direct"
            ? participantMap.get(conversation.id)
            : undefined,
        last_read_at:
          readStates[conversation.id] ?? null,
      })
    );
  };

export const findDirectConversationService =
  async (
    orgId: string,
    memberId: string,
    otherUserId: string,
    accessToken: string
  ): Promise<ConversationWithLastMessage | null> => {
    const {
      conversations,
      members,
    } =
      await getUserConversationDataService(
        orgId,
        memberId,
        accessToken
      );

    if (!conversations.length) {
      return null;
    }

    const membersMap = new Map<
      string,
      string[]
    >();

    for (const member of members) {
      const participants =
        Array.isArray(member.member)
          ? member.member
          : [member.member];

      const participantIds =
        participants
          .filter(Boolean)
          .map(
            (participant) => participant.id
          );

      const existing =
        membersMap.get(
          member.conversation_id
        ) ?? [];

      membersMap.set(
        member.conversation_id,
        [
          ...existing,
          ...participantIds,
        ]
      );
    }

    for (const conversation of conversations) {
      if (conversation.type !== "direct") {
        continue;
      }

      const participantIds =
        membersMap.get(
          conversation.id
        ) ?? [];

      if (
        participantIds.length === 2 &&
        participantIds.includes(memberId) &&
        participantIds.includes(otherUserId)
      ) {
        return conversation;
      }
    }

    return null;
  };

export const createDirectConversationService =
  async (
    orgId: string,
    memberId: string,
    otherMemberId: string,
    accessToken: string
  ) => {
    if (otherMemberId === memberId) {
      throw new AppError(
        400,
        "You can't start a direct conversation with yourself."
      );
    }

    const targetMember =
      await getActiveMemberFromDB(
        orgId,
        otherMemberId
      );

    if (!targetMember) {
      throw new AppError(
        400,
        "Selected user is not an active member of your organization."
      );
    }

    const existing =
      await findDirectConversationService(
        orgId,
        memberId,
        otherMemberId,
        accessToken
      );

    if (existing) {
      return {
        existing: true,
        data: existing,
      };
    }

    const conversation =
      await createNewConversationToDB(
        orgId,
        memberId,
        "direct"
      );

    await addMemberInConversationToDB(
      conversation.id,
      memberId,
      otherMemberId,
      accessToken
    );

    const otherProfile =
      Array.isArray(targetMember.profile)
        ? targetMember.profile[0]
        : targetMember.profile;

    const data = {
      ...conversation,
      other_participant: {
        id: targetMember.id,
        profile: {
          id: otherProfile.id,
          first_name:
            otherProfile.first_name,
          last_name:
            otherProfile.last_name,
          avatar_url:
            otherProfile.avatar_url ?? null,
        },
      },
      last_read_at: null,
    };

    return {
      existing: false,
      data,
    };
  };