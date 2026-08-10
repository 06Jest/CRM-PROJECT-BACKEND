import crypto from "crypto";
import { AppError } from "../middleware/error.middleware";
import { table } from "../config/tables";
import { CreateInviteDTO, OrganizationInvite } from "../types/organization.invite";
import { createSupabaseUserClient, supabaseAdmin } from "../config/supabase";
import { Profile } from "../types/profile";
import { OrganizationMember } from "../types/organization.member";
import { addOrganizationMemberToDB, getMembershipForAuthFromDB } from "./organization.members.service";
import { completeOnboardingInDB } from "./profiles.service";
import { joinDefaultConversations } from "./chats/conversation.member.service";

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



export const createInviteAcceptance = async (
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


export const createInvite = async (
  orgId: string,
  createdBy: string,
  dto: CreateInviteDTO,
  accessToken: string
): Promise<OrganizationInvite> => {

  const db = createSupabaseUserClient(accessToken);

  const code = crypto
    .randomBytes(24)
    .toString("base64url");

  const { data, error } = await db
    .from(tab)
    .insert({
      org_id: orgId,
      created_by: createdBy,
      code,
      role: dto.role,
      email: dto.email ?? null,
      max_uses: dto.max_uses,
      expires_at: dto.expires_at,
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


export const getInviteByCode = async (
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


export const getOrganizationInvites = async (
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


export const revokeInvite = async (
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

export const validateInvite = (
  invite: OrganizationInvite,
  email: string
): OrganizationInvite => {

  if (invite.status !== "active") {
    throw new AppError(
      400,
      "Invite is no longer active."
    );
  }

  if (
    new Date(invite.expires_at) <= new Date()
  ) {
    throw new AppError(
      400,
      "Invite has expired."
    );
  }

  if (
    invite.used_count >= invite.max_uses
  ) {
    throw new AppError(
      400,
      "Invite has already reached its usage limit."
    );
  }

  if (
    invite.email &&
    invite.email.toLowerCase() !== email.toLowerCase()
  ) {
    throw new AppError(
      403,
      "This invite was created for another email address."
    );
  }

  return invite;
};

export const acceptInvite = async (
  code: string,
  profile: Profile,
  accessToken: string
): Promise<OrganizationMember> => {

  const invite = await getInviteByCode(code);

  validateInvite(
    invite,
    profile.email
  );

  const existingMembership =
    await getMembershipForAuthFromDB(profile.id);

  if (existingMembership) {
    throw new AppError(
      400,
      "You already belong to an organization."
    );
  }

  const member = await addOrganizationMemberToDB({
    org_id: invite.org_id,
    profile_id: profile.id,
    role: invite.role,
    status: "invited",
  });

  await joinDefaultConversations(
    invite.org_id,
    member.id
  );

  await createInviteAcceptance(
    invite.id,
    profile.id,
    accessToken
  );

  await completeOnboardingInDB(
    profile.id,
    accessToken
  );

  const uses = invite.used_count + 1;

  const db = supabaseAdmin;

  const { error } = await db
    .from(tab)
    .update({
      used_count: uses,
      status:
        uses >= invite.max_uses
          ? "completed"
          : invite.status,
    })
    .eq("id", invite.id);

  if (error) {
    throw new AppError(
      500,
      `Failed to update invite: ${error.message}`
    );
  }

  return member;
};