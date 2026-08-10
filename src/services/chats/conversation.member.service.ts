import { createSupabaseUserClient, supabaseAdmin } from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";
import { ConversationType, MemberData } from "../../types/chat";
import { OrganizationType } from "../../types/organization";
import { createNewConversationToDB } from "./conversation.service";

const memberTab = table.chat.members;
const memberFkey = "conversation_members_member_id_fkey";
const mData = `
  conversation_id,
  member:organization_members!${memberFkey}(
    id,
    role,
    profile:profiles!organization_members_profile_fkey(
      id,
      first_name,
      last_name,
      avatar_url
    )
  )
`;

export const ensureConversationMember = async (
  conversationId: string,
  memberId: string,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);
  const { data, error } = await db
    .from(memberTab)
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("member_id", memberId)
    .maybeSingle();

  if (error) {
    throw new AppError(
      500,
      `Failed to verify conversation member: ${error.message}`
    );
  }

  if (!data) {
    throw new AppError(
      403,
      "You are not a member of this conversation."
    );
  }
};

export const getMembershipsFromDB = async (
  memberId: string,
  accessToken: string
): Promise<string[]> => {
  const db = createSupabaseUserClient(accessToken);
  const { data, error } =
    await db
      .from(memberTab)
      .select("conversation_id")
      .eq("member_id", memberId);

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch memberships: ${error.message}`
    );
  }

  return (data ?? []).map(
    (membership) => membership.conversation_id
  );
};

export const getMembersFromDB = async (
  conversationIds: string[],
  accessToken: string
): Promise<MemberData[]> => {
  if (conversationIds.length === 0) {
    return [];
  }

  const db = createSupabaseUserClient(accessToken);
  const { data, error } =
    await db
      .from(memberTab)
      .select(mData)
      .in("conversation_id", conversationIds);

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch conversation members: ${error.message}`
    );
  }
  const members = (data ?? []).map((conversation) => {
    const memberArray = Array.isArray(conversation.member)
      ? conversation.member
      : [conversation.member];

    return {
      conversation_id: conversation.conversation_id,
      member: memberArray.map((member) => ({
        ...member,
        profile: Array.isArray(member.profile)
          ? member.profile[0]
          : member.profile,
      })),
    };
  });

  return members;
};

export const addMemberInConversationToDB = async (
  conversationId: string,
  memberId: string,
  otherUserId: string,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);
  const { error } = await db
    .from(memberTab)
    .insert([
      {
        conversation_id: conversationId,
        member_id: memberId,
      },
      {
        conversation_id: conversationId,
        member_id: otherUserId,
      },
    ]);

  if (error) {
    throw new AppError(
      500,
      `Failed to create conversation members: ${error.message}`
    );
  }
};



export const markConversationAsReadFromDB = async (
  conversationId: string,
  memberId: string,
  accessToken: string
): Promise<{ last_read_at: string }> => {
  await ensureConversationMember(
    conversationId,
    memberId,
    accessToken
  );

  const db = createSupabaseUserClient(accessToken);

  const readAt = new Date().toISOString();

  const { data, error } = await db
    .from(memberTab)
    .update({
      last_read_at: readAt,
    })
    .eq("conversation_id", conversationId)
    .eq("member_id", memberId)
    .select("last_read_at")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to mark Conversation as read: ${error.message}`
    );
  }

  return data;
};




export const getMyReadStatesFromDB = async (
  conversationIds: string[],
  memberId: string,
  accessToken: string
): Promise<Record<string, string | null>> => {


  if (!conversationIds.length) {
    return {};
  }



  const db = createSupabaseUserClient(accessToken);



  const { data, error } = await db
    .from(memberTab)
    .select("conversation_id, last_read_at")
    .eq("member_id", memberId)
    .in("conversation_id", conversationIds);



  if (error) {
    throw new AppError(
      500,
      `Failed to fetch read states: ${error.message}`
    );
  }



  const map: Record<string, string | null> = {};


  for (const row of data ?? []) {
    map[row.conversation_id] = row.last_read_at;
  }


  return map;
};

export const addConversationMemberToDB = async (
  conversationId: string,
  memberId: string,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(memberTab)
    .insert({
      conversation_id: conversationId,
      member_id: memberId,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to add conversation member: ${error.message}`
    );
  }
};

export const addDefaultConversationMemberToDB = async (
  conversationId: string,
  memberId: string,
): Promise<void> => {
  const db = supabaseAdmin;

  const { error } = await db
    .from(memberTab)
    .insert({
      conversation_id: conversationId,
      member_id: memberId,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to add conversation member: ${error.message}`
    );
  }
};

export const createDefaultConversationsToDB = async (
  orgId: string,
  memberId: string,
  orgType: OrganizationType,
  accessToken: string
): Promise<void> => {
  if (orgType === "personal") {
    return;
  }


  if (!memberId) {
    throw new AppError(
      401,
      "Not a Member in Organization"
    );
  }

  const conversationTypes: ConversationType[] = [
    "organization",
    "announcement",
  ];

  for (const type of conversationTypes) {
    const conversation = await createNewConversationToDB(
      orgId,
      memberId,
      type
    );

    await addDefaultConversationMemberToDB(
      conversation.id,
      memberId,
    );
  }
};

export const joinDefaultConversations = async (
  orgId: string,
  memberId: string,
): Promise<void> => {
  const db = supabaseAdmin;

  if (!memberId) {
    throw new AppError(
      401,
      "Not a Member in Organization"
    );
  }

  const conversationTypes: ConversationType[] = [
    "organization",
    "announcement",
  ];

  const { data: conversations, error } = await db
    .from(table.chat.conversations)
    .select("id, type")
    .eq("org_id", orgId)
    .in("type", conversationTypes);

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch default conversations: ${error.message}`
    );
  }

  if (!conversations?.length) {
    return;
  }

  for (const conversation of conversations) {
    const { error: memberError } = await db
      .from(memberTab)
      .insert({
        conversation_id: conversation.id,
        member_id: memberId,
      });

    if (memberError) {
      if (memberError.code === "23505") {
        continue;
      }

      throw new AppError(
        500,
        `Failed to join default conversation: ${memberError.message}`
      );
    }
  }
};