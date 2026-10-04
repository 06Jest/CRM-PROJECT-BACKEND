import { deleteImageKitFile } from "../../services/imagekit.service";

import {
  getProfileIfExistFromDB,
  checkEmailIfExistFromDB,
  getProfileByIdFromDB,
  isProfileExistFromDB,
  createProfileToDB,
  getProfileByIdForAuthFromDB,
  updateProfileSetupToDB,
  updateProfileFromDB,
  getCurrentProfileAvatarFromDB,
  updateProfileAvatarFromDB,
  updateProfileStatusFromDB,
  updateOnboardingStepToDB,
  completeOnboardingInDB,
  updateLastLoginToDB,
  deleteProfileFromDB,
} from "./profiles.repository";

import type {
  Profile,
  UpdateProfileDTO,
  DisplayProfile,
  CreateInitialProfileDTO,
  CompleteProfileDTO,
  ProfileStatus,
} from "./profiles.types";

import type { OnboardingStep } from "../../types/global";


export const getProfileIfExistService = async (
  userId: string
): Promise<Profile | null> => {
  return getProfileIfExistFromDB(userId);
};


export const checkEmailIfExistService = async (
  email: string
): Promise<{ id: string; email: string } | null> => {
  return checkEmailIfExistFromDB(email);
};


export const getProfileService = async (
  userId: string,
  accessToken: string
): Promise<DisplayProfile> => {
  return getProfileByIdFromDB(userId, accessToken);
};


export const isProfileExistService = async (
  userId: string
): Promise<{ id: string } | null> => {
  return isProfileExistFromDB(userId);
};


export const createProfileService = async (
  dto: CreateInitialProfileDTO
): Promise<Profile> => {
  return createProfileToDB(dto);
};


export const getProfileByIdForAuthService = async (
  userId: string
): Promise<Profile> => {
  return getProfileByIdForAuthFromDB(userId);
};

export const completeProfileSetupService = async (
  userId: string,
  dto: CompleteProfileDTO,
  accessToken: string
): Promise<Profile> => {
  return updateProfileSetupToDB(
    userId,
    dto,
    accessToken
  );
};


export const updateProfileService = async (
  userId: string,
  dto: UpdateProfileDTO,
  accessToken: string
): Promise<Profile> => {
  return updateProfileFromDB(
    userId,
    dto,
    accessToken
  );
};


export const updateProfileAvatarService = async (
  userId: string,
  avatarUrl: string | null,
  avatarFileId: string | null,
  accessToken: string
): Promise<{
  avatar_url: string | null;
  avatar_file_id: string | null;
}> => {
  const oldFileId =
    await getCurrentProfileAvatarFromDB(
      userId,
      accessToken
    );

  const avatar =
    await updateProfileAvatarFromDB(
      userId,
      avatarUrl,
      avatarFileId,
      accessToken
    );

  if (
    oldFileId &&
    oldFileId !== avatarFileId
  ) {
    try {
      await deleteImageKitFile(oldFileId);
    } catch (err) {
      console.error(
        `Failed to delete old ImageKit avatar ${oldFileId}:`,
        err
      );
    }
  }

  return avatar;
};


export const updateProfileStatusService = async (
  userId: string,
  status: ProfileStatus,
  accessToken: string
): Promise<string> => {
  return updateProfileStatusFromDB(
    userId,
    status,
    accessToken
  );
};


export const updateOnboardingStepService = async (
  userId: string,
  step: OnboardingStep,
  accessToken: string
): Promise<Profile> => {
  return updateOnboardingStepToDB(
    userId,
    step,
    accessToken
  );
};


export const completeOnboardingService = async (
  userId: string,
  accessToken: string
): Promise<Profile> => {
  return completeOnboardingInDB(
    userId,
    accessToken
  );
};

export const updateLastLoginService = async (
  profileId: string,
  accessToken: string
): Promise<void> => {
  return updateLastLoginToDB(
    profileId,
    accessToken
  );
};


export const deleteProfileService = async (
  userId: string,
  accessToken: string
): Promise<string> => {
  return deleteProfileFromDB(
    userId,
    accessToken
  );
};