import {
  createSupabaseUserClient,
  supabaseAdmin,
} from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import type { OrganizationInvite } from "./organization-invites.types";

const tab = table.orginvites;
const acceptanceTab = table.acceptances;

const acceptanceFkey =
  "organization_invite_acceptances_invite_id_fkey";

const selectAllWithAcceptances = `
  *,
  acceptances:organization_invite_acceptances!${acceptanceFkey}(
    id,
    profile_id,
    accepted_at,
    profile:profiles(
      first_name,
      last_name,
      email,
      avatar_url
    )
  )
`;

const all = selectAllWithAcceptances;

// Create invite
export const createInviteInDB = async (
  orgId: string,
  createdBy: string,
  code: string,
  role: string,
  email: string | null,
  maxUses: number | null,
  expiresAt: string | null,
  accessToken: string
): Promise<OrganizationInvite> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert({
      org_id: orgId,
      created_by: createdBy,
      code,
      role,
      email,
      max_uses: maxUses,
      expires_at: expiresAt,
    })
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to create invite: ${error.message}`
    );
  }

  return data;
};

// Get invite by code
export const getInviteByCodeFromDB = async (
  code: string
): Promise<OrganizationInvite> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("code", code)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch invite: ${error.message}`
    );
  }

  if (!data) {
    throw new AppError(
      404,
      "Invite not found"
    );
  }

  return data;
};

// Get organization invites
export const getOrganizationInvitesFromDB = async (
  orgId: string,
  accessToken: string
): Promise<OrganizationInvite[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch invites: ${error.message}`
    );
  }

  return data ?? [];
};

// Revoke invite
export const revokeInviteInDB = async (
  inviteId: string,
  orgId: string,
  accessToken: string
): Promise<OrganizationInvite> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status: "revoked",
    })
    .eq("id", inviteId)
    .eq("org_id", orgId)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to revoke invite: ${error.message}`
    );
  }

  if (!data) {
    throw new AppError(
      404,
      "Invite not found in your organization"
    );
  }

  return data;
};

// Create invite acceptance
export const createInviteAcceptanceInDB = async (
  inviteId: string,
  profileId: string,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(acceptanceTab)
    .insert({
      invite_id: inviteId,
      profile_id: profileId,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to record invite acceptance: ${error.message}`
    );
  }
};

// Update invite usage
export const updateInviteUsageInDB = async (
  inviteId: string,
  usedCount: number,
  maxUses: number,
  status: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(tab)
    .update({
      used_count: usedCount,
      status:
        usedCount >= maxUses
          ? "completed"
          : status,
    })
    .eq("id", inviteId);

  if (error) {
    throw new AppError(
      500,
      `Failed to update invite: ${error.message}`
    );
  }
};