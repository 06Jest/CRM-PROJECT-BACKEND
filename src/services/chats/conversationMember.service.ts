import { supabaseAdmin } from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";
import { MemberData } from "../../types/chat";


const memberTab = table.chat.members;
const profileFkey =  'conversation_members_profile_id_fkey';

const mData = `
  conversation_id,
  member:profiles!${profileFkey}(
    id,
    avatar_url,
    display_name
  )
`;

export const ensureConversationMember = async (
  conversationId: string,
  userId: string
): Promise<void> => {

  const { data, error } = await supabaseAdmin
    .from(memberTab)
    .select("id")
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId)
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
  userId: string
): Promise<string[]> => {

  const { data, error } =
    await supabaseAdmin
      .from(memberTab)
      .select("conversation_id")
      .eq("profile_id", userId);

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
  conversationIds: string[]
): Promise<MemberData[]> => {

  if (conversationIds.length === 0) {
    return [];
  }

  const { data, error } =
    await supabaseAdmin
      .from(memberTab)
      .select(mData)
      .in("conversation_id", conversationIds);
  
  if (error) {
    throw new AppError(
      500,
      `Failed to fetch conversation members: ${error.message}`
    );
  }

  return data ?? [];
};

export const addMemberInConversationToDB = async (
  conversationId: string,
  userId: string,
  otherUserId: string
): Promise<void> => {

  const { error } = await supabaseAdmin
    .from(memberTab)
    .insert([
      {
        conversation_id: conversationId,
        profile_id: userId,
      },
      {
        conversation_id: conversationId,
        profile_id: otherUserId,
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
  userId: string
): Promise<void> => {
  await ensureConversationMember(
    conversationId,
    userId
  );

  const { error } = await supabaseAdmin
    .from(memberTab)
    .update({
      last_read_at: new Date().toISOString(),
    })
    .eq("conversation_id", conversationId)
    .eq("profile_id", userId);

  if (error) {
    throw new AppError(
      500,
      `Failed to mark Conversation as read: ${error.message}`
    );
  }
};

export const getMyReadStatesFromDB = async (
  conversationIds: string[],
  userId: string
): Promise<Record<string, string | null>> => {
  if (!conversationIds.length) return {};

  const { data, error } = await supabaseAdmin
    .from(memberTab)
    .select("conversation_id, last_read_at")
    .eq("profile_id", userId)
    .in("conversation_id", conversationIds);

  if (error) {
    throw new AppError(500, `Failed to fetch read states: ${error.message}`);
  }

  const map: Record<string, string | null> = {};
  for (const row of data ?? []) {
    map[row.conversation_id] = row.last_read_at;
  }
  return map;
};
