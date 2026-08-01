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

import { getProfileByIdForAuthFromDB, getProfileByIdFromDB } from "./profiles.service";

export const signUpWithAuth = async (
  dto: SignUpDTO
): Promise<void> => {
  const db = createSupabaseClient();

  const { error } = await db.auth.signUp({
    email: dto.email.trim().toLowerCase(),
    password: dto.password,
    options: {
      data: {
        first_name: dto.first_name,
        last_name: dto.last_name,
        org_name: dto.org_name,
      },
    },
  });

  if (error) {
    throw new AppError(
      400,
      `Failed to create account: ${error.message}`
    );
  }
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
    orgId,
    profileId,
  } = await rotateRefreshToken(
    rawRefreshToken,
    meta
  );

  // TODO:
  // When profiles.service is migrated to RLS,
  // replace this with a user-scoped query.
  const profile = await getProfileByIdForAuthFromDB(
    profileId,
    orgId
  );

  const accessToken = createAccessToken(profile);

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