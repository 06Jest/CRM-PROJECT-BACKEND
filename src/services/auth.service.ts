import {
  createSupabaseClient,
  createSupabaseUserClient,
} from "../config/supabase";

import type {
  SignUpDTO,
  SignInDTO,
  ChangePasswordDTO,
  RequestMeta,
  TokenPair,
} from "../types/auth";

import { AppError } from "../middleware/error.middleware";

import {
  createAccessToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForProfile,
} from "./jwt.service";

import {  getProfileIfExistFromDB } from "./profiles.service";
import { getMembershipForAuthFromDB } from "./organization.members.service";

export const signUpWithAuth = async (
  dto: SignUpDTO
) => {
  const db = createSupabaseClient();

  const { data, error } = await db.auth.signUp({
    email: dto.email.trim().toLowerCase(),
    password: dto.password,
  });

  if (error) {
    throw new AppError(
      400,
      `Failed to create account: ${error.message}`
    );
  }

  if (!data.user) {
    throw new AppError(
      500,
      "Failed to create user."
    );
  }

  return data.user;
};

export const signInWithAuth = async (
  dto: SignInDTO
) => {
  const db = createSupabaseClient();

  const { data, error } =
    await db.auth.signInWithPassword({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    });

  if (error) {
    throw new AppError(
      400,
      `Failed to log in: ${error.message}`
    );
  }

  return data;
};

export const newRefresh = async (
  rawRefreshToken: string,
  meta: RequestMeta
): Promise<TokenPair> => {

  const {
    newRawToken,
    profileId,
  } = await rotateRefreshToken(
    rawRefreshToken,
    meta
  );


  const profile =
    await getProfileIfExistFromDB(profileId);


  if (!profile) {
    throw new AppError(
      404,
      "Profile not found"
    );
  }


  let membership = null;


  if (profile.onboarding_completed) {

    membership =
      await getMembershipForAuthFromDB(
        profile.id
      );

    if (!membership) {
      throw new AppError(
        403,
        "Organization membership not found"
      );
    }
  }


  const accessToken =
    createAccessToken(
      profile,
      membership
    );


  return {
    accessToken,
    refreshToken: newRawToken,
  };
};

export const requestPasswordReset = async (
  email: string
): Promise<void> => {
  const db = createSupabaseClient();

  const { error } =
    await db.auth.resetPasswordForEmail(email);

  if (error) {
    throw new AppError(
      400,
      `Failed to request password reset: ${error.message}`
    );
  }
};



export const changePasswordFromAuth = async (
  user: ChangePasswordDTO,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const { error: verifyError } =
    await db.auth.signInWithPassword({
      email: user.email,
      password: user.current_password,
    });

  if (verifyError) {
    throw new AppError(
      401,
      "Current password is incorrect"
    );
  }

  const { error } =
    await db.auth.updateUser({
      password: user.new_password,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to update password: ${error.message}`
    );
  }

  await revokeAllForProfile(user.id);
};

export const signOutFromAuth = async (
  rawRefreshToken: string
): Promise<void> => {
  await revokeRefreshToken(rawRefreshToken);
};

export const signOutAllSessions = async (
  profileId: string
): Promise<void> => {
  await revokeAllForProfile(profileId);
};