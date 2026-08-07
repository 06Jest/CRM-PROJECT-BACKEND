import { createSupabaseUserClient, supabaseAdmin } from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import {
  ConversationListItem,
  ConversationType,
  ConversationWithLastMessage,
  UserConversationData,
} from "../../types/chat";

import {
  addMemberInConversationToDB,
  getMembersFromDB,
  getMembershipsFromDB,
  getMyReadStatesFromDB,
} from "./conversation.member.service";

const conversationTab = table.chat.conversations;
const lastMessageFkey = "conversations_last_message_id_fkey";
const all = `
  *,
  last_message:messages!${lastMessageFkey}(
    id,
    content,
    created_at,
    sender: organization_members!messages_sender_id_fkey(
      id,
      profile: profiles!organization_members_profile_fkey(
        first_name,
        last_name,
        avatar_url
      )
    )
  )
`;

export const getUserConversationDataFromDB = async (
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
  return {conversations,members,};
};

export const getConversationByIDFromDB = async (
  orgId: string,
  conversationID: string,
  accessToken: string
): Promise<ConversationWithLastMessage> => {
  const db = createSupabaseUserClient(accessToken);
  const { data, error } =
    await db
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

export const getConversationsByIDsFromDB = async (
  orgId: string,
  conversationIds: string[],
  accessToken: string
): Promise<ConversationWithLastMessage[]> => {
  const db = createSupabaseUserClient(accessToken);
  const { data, error } =
    await db
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

  const sortedConversations =
    (data ?? []).sort((a, b) => {

      const aTime =
        a.last_message?.created_at ??
        a.created_at;

      const bTime =
        b.last_message?.created_at ??
        b.created_at;

      return (
        new Date(bTime).getTime() -
        new Date(aTime).getTime()
      );
    });
  return sortedConversations;
};


export const getUserConversationListItemsFromDB = async (
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<ConversationListItem[]> => {
  const {
    conversations,
    members,
  } =
    await getUserConversationDataFromDB(
      orgId,
      memberId,
      accessToken
    );

  if (!conversations.length) {
    return [];
  }
  const readStates =
    await getMyReadStatesFromDB(
      conversations.map((c) => c.id),
      memberId,
      accessToken
    );

  const participantMap = new Map<
    string,
    ConversationListItem["other_participant"]
  >();
  for (const member of members) {
    const participants =
      Array.isArray(member.member)
        ? member.member
        : [member.member];

    for (const participant of participants) {
      if (!participant || participant.id === memberId) {
        continue;
      }

      participantMap.set(
        member.conversation_id,
        {
          id: participant.id,
          fist_name: participant.profile.first_name,
          last_name: participant.profile.last_name,
          avatar_url:
            participant.profile.avatar_url ?? null,

        }
      );
    }
  }

  return conversations.map((conversation) => ({
    ...conversation,

    other_participant:
      conversation.type === "direct"
        ? participantMap.get(conversation.id)
        : undefined,

    my_last_read_at:
      readStates[conversation.id] ?? null,
  }));
};

export const findDirectConversationBetweenUsersFromDB = async (
  orgId: string,
  memberId: string,
  otherUserId: string,
  accessToken: string
): Promise<ConversationWithLastMessage | null> => {
  const {
    conversations,
    members,
  } =
    await getUserConversationDataFromDB(
      orgId,
      memberId,
      accessToken
    );

  if (!conversations.length) {
    return null;
  }

  const membersMap =
    new Map<string, string[]>();

  for (const member of members) {
    const participants =
      Array.isArray(member.member)
        ? member.member
        : [member.member];

    const participantIds =
      participants
        .filter(Boolean)
        .map((p) => p.id);

    const existing =
      membersMap.get(member.conversation_id) ?? [];

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
      membersMap.get(conversation.id) ?? [];

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

export const createNewConversationToDB = async (
  orgId: string,
  memberId: string,
  type: ConversationType,
): Promise<ConversationWithLastMessage> => {
  const db = supabaseAdmin;
  const { data, error } =
    await db
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

export const createDirectConversationToDB = async (
  orgId: string,
  memberId: string,
  otherUserId: string,
  accessToken: string
): Promise<ConversationWithLastMessage> => {
  const conversation =
    await createNewConversationToDB(
      orgId,
      memberId,
      "direct",
    );

  await addMemberInConversationToDB(
    conversation.id,
    memberId,
    otherUserId,
    accessToken
  );
  return conversation;
};