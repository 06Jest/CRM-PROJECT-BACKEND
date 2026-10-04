import {
  createSupabaseUserClient,
  supabaseAdmin,
} from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import type {
  CreateOrganizationMemberDTO,
  DisplayOrganizationMember,
  OrganizationMember,
  OrganizationMemberStatus,
} from "./organization-members.types";

import type { Roles } from "../../types/global";

const tab = table.orgmembers;

const fkey = "organization_members_profile_fkey";

const selectAllWithProfile = `
  *,
  profile:profiles!${fkey}(
    id,
    first_name,
    last_name,
    email,
    avatar_url
  )
`;

const all = selectAllWithProfile;

// Get membership for authentication
export const getMembershipForAuthFromDB = async (
  profileId: string
): Promise<OrganizationMember | null> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select("*")
    .eq("profile_id", profileId)
    .maybeSingle();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch membership: ${error.message}`
    );
  }

  return data;
};

// Get member ID by profile ID
export const getMemberIDbyProfileIDFromDB = async (
  profileId: string
): Promise<{ id: string }> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select("id")
    .eq("profile_id", profileId)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch membership: ${error.message}`
    );
  }

  return data;
};

// Get members list
export const getMembersListItemFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .is("deleted_at", null);

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch profile: ${error.message}`
    );
  }

  return data ?? [];
};

// Add organization member
export const addOrganizationMemberToDB = async (
  dto: CreateOrganizationMemberDTO
): Promise<OrganizationMember> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .insert({
      org_id: dto.org_id,
      profile_id: dto.profile_id,
      role: dto.role,
      status: dto.status ?? "invited",
    })
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to add organization member: ${error.message}`
    );
  }

  return data;
};

// Get organization member by ID
export const getOrganizationMemberByIdFromDB = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<OrganizationMember> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select("*")
    .eq("id", memberId)
    .eq("org_id", orgId)
    .single();

  if (error || !data) {
    throw new AppError(
      403,
      "User is not a member of this organization"
    );
  }

  return data;
};

// Get all organization members
export const getOrganizationMembersFromDB = async (
  orgId: string,
  accessToken: string
): Promise<OrganizationMember[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(`
      *,
      profile:profiles(
        id,
        first_name,
        last_name,
        email,
        avatar_url
      )
    `)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      error.message
    );
  }

  return data ?? [];
};

// Get active profiles
export const getActiveProfilesFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select("*")
    .eq("org_id", orgId)
    .eq("status", "active")
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch member profiles: ${error.message}`
    );
  }

  return data ?? [];
};

// Get all agents
export const getAllAgentsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<OrganizationMember[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select("*")
    .eq("org_id", orgId)
    .eq("role", "agent")
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch member agents: ${error.message}`
    );
  }

  return data ?? [];
};

// Get member with profile
export const getMemberWithProfileFromDB = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq("id", memberId)
    .eq("org_id", orgId)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch updated member: ${error.message}`
    );
  }

  return data as DisplayOrganizationMember;
};

// Update member role
export const updateMemberRoleInDB = async (
  memberId: string,
  orgId: string,
  role: Roles,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({ role })
    .eq("id", memberId)
    .eq("status", "active")
    .eq("org_id", orgId)
    .select("id")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update member role: ${error.message}`
    );
  }

  return getMemberWithProfileFromDB(
    data.id,
    orgId,
    accessToken
  );
};

// Check active member count
export const getActiveMemberCountFromDB = async (
  orgId: string,
  accessToken: string
): Promise<number> => {
  const db = createSupabaseUserClient(accessToken);

  const { count, error } = await db
    .from(tab)
    .select("id", {
      count: "exact",
      head: true,
    })
    .eq("org_id", orgId)
    .eq("status", "active")
    .is("deleted_at", null);

  if (error) {
    throw new AppError(
      500,
      `Failed to check active member limit: ${error.message}`
    );
  }

  return count ?? 0;
};

// Update member status
export const updateMemberStatusInDB = async (
  memberId: string,
  orgId: string,
  status: OrganizationMemberStatus,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({ status })
    .eq("org_id", orgId)
    .eq("id", memberId)
    .select("id")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update status: ${error.message}`
    );
  }

  return getMemberWithProfileFromDB(
    data.id,
    orgId,
    accessToken
  );
};

// Approve join member
export const approveJoinMemberInDB = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status: "active",
    })
    .eq("org_id", orgId)
    .eq("id", memberId)
    .eq("status", "invited")
    .select("id")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update status: ${error.message}`
    );
  }

  return getMemberWithProfileFromDB(
    data.id,
    orgId,
    accessToken
  );
};

// Reject join member
export const rejectJoinMemberInDB = async (
  memberId: string,
  orgId: string
): Promise<{ id: string }> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .delete()
    .eq("org_id", orgId)
    .eq("id", memberId)
    .eq("status", "invited")
    .select("id")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to reject join request: ${error.message}`
    );
  }

  return data;
};

// Create owner member
export const createOwnerMemberToDB = async (
  orgId: string,
  userId: string
): Promise<OrganizationMember> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .insert({
      org_id: orgId,
      profile_id: userId,
      role: "owner",
      status: "active",
    })
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      error.message
    );
  }

  return data;
};

// Remove organization member
export const removeOrganizationMemberFromDB = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status: "removed",
      deleted_at: new Date().toISOString(),
    })
    .eq("id", memberId)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select("id")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to remove member: ${error.message}`
    );
  }

  return getMemberWithProfileFromDB(
    data.id,
    orgId,
    accessToken
  );
};