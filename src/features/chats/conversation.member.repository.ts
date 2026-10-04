import {
  createSupabaseUserClient,
  supabaseAdmin,
} from "../../config/supabase";

import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import {
  MemberData,
} from "./chats.types";

const memberTab =
  table.chat.members;

const memberFkey =
  "conversation_members_member_id_fkey";

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

export const ensureConversationMemberFromDB =
  async (
    conversationId: string,
    memberId: string,
    accessToken: string
  ): Promise<void> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from(memberTab)
      .select("id")
      .eq(
        "conversation_id",
        conversationId
      )
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

export const getMembershipsFromDB =
  async (
    memberId: string,
    accessToken: string
  ): Promise<string[]> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
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
      (membership) =>
        membership.conversation_id
    );
  };

export const getMembersFromDB =
  async (
    conversationIds: string[],
    accessToken: string
  ): Promise<MemberData[]> => {
    if (conversationIds.length === 0) {
      return [];
    }

    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from(memberTab)
      .select(mData)
      .in(
        "conversation_id",
        conversationIds
      );

    if (error) {
      throw new AppError(
        500,
        `Failed to fetch conversation members: ${error.message}`
      );
    }

    return (data ?? []).map(
      (conversation) => {
        const memberArray =
          Array.isArray(
            conversation.member
          )
            ? conversation.member
            : [conversation.member];

        return {
          conversation_id:
            conversation.conversation_id,
          member: memberArray.map(
            (member) => ({
              ...member,
              profile:
                Array.isArray(
                  member.profile
                )
                  ? member.profile[0]
                  : member.profile,
            })
          ),
        };
      }
    );
  };

export const addMemberInConversationToDB =
  async (
    conversationId: string,
    memberId: string,
    otherUserId: string,
    accessToken: string
  ): Promise<void> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { error } = await db
      .from(memberTab)
      .insert([
        {
          conversation_id:
            conversationId,
          member_id: memberId,
        },
        {
          conversation_id:
            conversationId,
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

export const markConversationAsReadFromDB =
  async (
    conversationId: string,
    memberId: string,
    readAt: string,
    accessToken: string
  ): Promise<{ last_read_at: string }> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from(memberTab)
      .update({
        last_read_at: readAt,
      })
      .eq(
        "conversation_id",
        conversationId
      )
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

export const getMyReadStatesFromDB =
  async (
    conversationIds: string[],
    memberId: string,
    accessToken: string
  ): Promise<Record<string, string | null>> => {
    if (!conversationIds.length) {
      return {};
    }

    const db =
      createSupabaseUserClient(accessToken);

    const { data, error } = await db
      .from(memberTab)
      .select(
        "conversation_id, last_read_at"
      )
      .eq("member_id", memberId)
      .in(
        "conversation_id",
        conversationIds
      );

    if (error) {
      throw new AppError(
        500,
        `Failed to fetch read states: ${error.message}`
      );
    }

    const map: Record<
      string,
      string | null
    > = {};

    for (const row of data ?? []) {
      map[row.conversation_id] =
        row.last_read_at;
    }

    return map;
  };

export const addConversationMemberToDB =
  async (
    conversationId: string,
    memberId: string,
    accessToken: string
  ): Promise<void> => {
    const db =
      createSupabaseUserClient(accessToken);

    const { error } = await db
      .from(memberTab)
      .insert({
        conversation_id:
          conversationId,
        member_id: memberId,
      });

    if (error) {
      throw new AppError(
        500,
        `Failed to add conversation member: ${error.message}`
      );
    }
  };

export const addDefaultConversationMemberToDB =
  async (
    conversationId: string,
    memberId: string
  ): Promise<void> => {
    const { error } =
      await supabaseAdmin
        .from(memberTab)
        .insert({
          conversation_id:
            conversationId,
          member_id: memberId,
        });

    if (error) {
      throw new AppError(
        500,
        `Failed to add conversation member: ${error.message}`
      );
    }
  };

export const getDefaultConversationsFromDB =
  async (orgId: string) => {
    const conversationTypes = [
      "organization",
      "announcement",
    ];

    const { data, error } =
      await supabaseAdmin
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

    return data ?? [];
  };