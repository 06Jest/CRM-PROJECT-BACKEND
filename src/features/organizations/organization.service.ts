import {
  createWorkspaceInDB,
  getWorkspaceDataFromDB,
  getWorkspaceNameFromDB,
  renameWorkspaceInDB,
  updateWorkspaceDetailsInDB,
} from "./organization.repository";

import type {
  Organization,
  CreateWorkspaceDTO,
  DisplayOrganization,
  UpdateWorkspaceDetailsDTO,
  CreateWorkspacePayload,
} from "./organization.types";

import { generateSlug } from "../../utils/slug";
import { createOwnerMemberService } from "./organization-members.service";
import { createDefaultConversationsService } from "../chats/conversation.member.service";
import { updateOnboardingStepService } from "../profiles/profiles.service";

// Get organization
export const getWorkspaceService = async (
  orgId: string,
  accessToken: string
): Promise<DisplayOrganization> => {
  return getWorkspaceDataFromDB(
    orgId,
    accessToken
  );
};

// Get organization name
export const getWorkspaceNameService = async (
  orgId: string,
  accessToken: string
): Promise<string> => {
  return getWorkspaceNameFromDB(
    orgId,
    accessToken
  );
};

// Create organization
export const createWorkspaceService = async (
  dto: CreateWorkspaceDTO,
  userId: string,
  accessToken: string
): Promise<Organization> => {
  const payload: CreateWorkspacePayload = {
    name: dto.name.trim(),
    slug: generateSlug(dto.name),
    type: dto.type,
    industry: dto.industry ?? null,
    product_type: dto.product_type ?? null,
    company_size: dto.company_size ?? null,
  };

  const workspace = await createWorkspaceInDB(payload);

  const member = await createOwnerMemberService(
    workspace.id,
    userId
  );

  await createDefaultConversationsService(
    workspace.id,
    member.id,
    workspace.type,
    accessToken
  );

  await updateOnboardingStepService(
    userId,
    2,
    accessToken
  );

  return workspace;
};

// Rename organization
export const renameWorkspaceService = async (
  orgId: string,
  name: string,
  accessToken: string
): Promise<Organization> => {
  const trimmedName = name.trim();
  const slug = generateSlug(trimmedName);

  return renameWorkspaceInDB(
    orgId,
    trimmedName,
    slug,
    accessToken
  );
};

// Update organization details
export const updateWorkspaceDetailsService = async (
  orgId: string,
  updates: UpdateWorkspaceDetailsDTO,
  accessToken: string
): Promise<DisplayOrganization> => {
  const payload: Record<string, unknown> = {
    ...updates,
  };

  if (
    typeof updates.name === "string" &&
    updates.name.trim()
  ) {
    payload.name = updates.name.trim();
    payload.slug = generateSlug(updates.name);
  }

  return updateWorkspaceDetailsInDB(
    orgId,
    payload,
    accessToken
  );
};