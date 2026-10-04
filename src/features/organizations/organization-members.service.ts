import { AppError } from "../../middleware/error.middleware";
import type { Roles } from "../../types/global";

import type {
  CreateOrganizationMemberDTO,
  DisplayOrganizationMember,
  OrganizationMember,
  OrganizationMemberStatus,
} from "./organization-members.types";

import {
  getMembershipForAuthFromDB,
  getMemberIDbyProfileIDFromDB,
  getMembersListItemFromDB,
  addOrganizationMemberToDB,
  getOrganizationMemberByIdFromDB,
  getOrganizationMembersFromDB,
  getActiveProfilesFromDB,
  getAllAgentsFromDB,
  getMemberWithProfileFromDB,
  updateMemberRoleInDB,
  getActiveMemberCountFromDB,
  updateMemberStatusInDB,
  approveJoinMemberInDB,
  rejectJoinMemberInDB,
  createOwnerMemberToDB,
  removeOrganizationMemberFromDB,
} from "./organization-members.repository";

// Get membership for authentication
export const getMembershipForAuthService = async (
  profileId: string
): Promise<OrganizationMember | null> => {
  return getMembershipForAuthFromDB(profileId);
};

// Get member ID by profile ID
export const getMemberIDbyProfileIDService = async (
  profileId: string
): Promise<{ id: string }> => {
  return getMemberIDbyProfileIDFromDB(profileId);
};

// Get members list
export const getMembersListItemService = async (
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember[]> => {
  return getMembersListItemFromDB(
    orgId,
    accessToken
  );
};

// Add organization member
export const addOrganizationMemberService = async (
  dto: CreateOrganizationMemberDTO
): Promise<OrganizationMember> => {
  return addOrganizationMemberToDB(dto);
};

// Get organization member by ID
export const getOrganizationMemberByIdService = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<OrganizationMember> => {
  return getOrganizationMemberByIdFromDB(
    memberId,
    orgId,
    accessToken
  );
};

// Get organization members
export const getOrganizationMembersService = async (
  orgId: string,
  accessToken: string
): Promise<OrganizationMember[]> => {
  return getOrganizationMembersFromDB(
    orgId,
    accessToken
  );
};

// Get active profiles
export const getActiveProfilesService = async (
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember[]> => {
  return getActiveProfilesFromDB(
    orgId,
    accessToken
  );
};

// Get all agents
export const getAllAgentsService = async (
  orgId: string,
  accessToken: string
): Promise<OrganizationMember[]> => {
  return getAllAgentsFromDB(
    orgId,
    accessToken
  );
};

// Get member with profile
export const getMemberWithProfileService = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  return getMemberWithProfileFromDB(
    memberId,
    orgId,
    accessToken
  );
};

// Require role
export const requireRole = (
  role: string,
  allowed: string[]
): void => {
  if (!allowed.includes(role)) {
    throw new AppError(
      403,
      "Insufficient permissions"
    );
  }
};

// Update member role
export const updateMemberRoleService = async (
  memberId: string,
  orgId: string,
  role: Roles,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  return updateMemberRoleInDB(
    memberId,
    orgId,
    role,
    accessToken
  );
};

// Update member status
export const updateMemberStatusService = async (
  memberId: string,
  orgId: string,
  status: OrganizationMemberStatus,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  if (status === "active") {
    await getActiveMemberCountFromDB(
      orgId,
      accessToken
    );
  }

  return updateMemberStatusInDB(
    memberId,
    orgId,
    status,
    accessToken
  );
};

// Approve join member
export const approveJoinMemberService = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  return approveJoinMemberInDB(
    memberId,
    orgId,
    accessToken
  );
};

// Reject join member
export const rejectJoinMemberService = async (
  memberId: string,
  orgId: string
): Promise<{ id: string }> => {
  return rejectJoinMemberInDB(
    memberId,
    orgId
  );
};

// Create owner member
export const createOwnerMemberService = async (
  orgId: string,
  userId: string
): Promise<OrganizationMember> => {
  return createOwnerMemberToDB(
    orgId,
    userId
  );
};

// Remove organization member
export const removeOrganizationMemberService = async (
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<DisplayOrganizationMember> => {
  return removeOrganizationMemberFromDB(
    memberId,
    orgId,
    accessToken
  );
};