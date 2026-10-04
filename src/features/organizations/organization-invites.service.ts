import crypto from "crypto";

import { AppError } from "../../middleware/error.middleware";

import type {
  CreateInviteDTO,
  OrganizationInvite,
} from "./organization-invites.types";

import type { Profile } from "../profiles/profiles.types";
import type { OrganizationMember } from "./organization-members.types";

import {
  createInviteInDB,
  getInviteByCodeFromDB,
  getOrganizationInvitesFromDB,
  revokeInviteInDB,
  createInviteAcceptanceInDB,
  updateInviteUsageInDB,
} from "./organization-invites.repository";

import {
  getMembershipForAuthService,
  addOrganizationMemberService,
} from "./organization-members.service";

import { completeOnboardingService } from "../profiles/profiles.service";

import { joinDefaultConversationsService } from "../chats/conversation.member.service";

// Create invite
export const createInviteService = async (
  orgId: string,
  createdBy: string,
  dto: CreateInviteDTO,
  accessToken: string
): Promise<OrganizationInvite> => {
  const code = crypto
    .randomBytes(24)
    .toString("base64url");

  return createInviteInDB(
    orgId,
    createdBy,
    code,
    dto.role,
    dto.email ?? null,
    dto.max_uses,
    dto.expires_at,
    accessToken
  );
};

// Get invite by code
export const getInviteByCodeService = async (
  code: string
): Promise<OrganizationInvite> => {
  return getInviteByCodeFromDB(code);
};

// Get organization invites
export const getOrganizationInvitesService = async (
  orgId: string,
  accessToken: string
): Promise<OrganizationInvite[]> => {
  return getOrganizationInvitesFromDB(
    orgId,
    accessToken
  );
};

// Revoke invite
export const revokeInviteService = async (
  inviteId: string,
  orgId: string,
  accessToken: string
): Promise<OrganizationInvite> => {
  return revokeInviteInDB(
    inviteId,
    orgId,
    accessToken
  );
};

// Validate invite
export const validateInviteService = (
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
    invite.email.toLowerCase() !==
      email.toLowerCase()
  ) {
    throw new AppError(
      403,
      "This invite was created for another email address."
    );
  }

  return invite;
};

// Accept invite
export const acceptInviteService = async (
  code: string,
  profile: Profile,
  accessToken: string
): Promise<OrganizationMember> => {
  const invite =
    await getInviteByCodeService(code);

  validateInviteService(
    invite,
    profile.email
  );

  const existingMembership =
    await getMembershipForAuthService(
      profile.id
    );

  if (existingMembership) {
    throw new AppError(
      400,
      "You already belong to an organization."
    );
  }

  const member =
    await addOrganizationMemberService({
      org_id: invite.org_id,
      profile_id: profile.id,
      role: invite.role,
      status: "invited",
    });

  await joinDefaultConversationsService(
    invite.org_id,
    member.id
  );

  await createInviteAcceptanceInDB(
    invite.id,
    profile.id,
    accessToken
  );

  await completeOnboardingService(
    profile.id,
    accessToken
  );

  const uses =
    invite.used_count + 1;

  await updateInviteUsageInDB(
    invite.id,
    uses,
    invite.max_uses,
    invite.status
  );

  return member;
};