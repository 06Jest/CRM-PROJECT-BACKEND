import {
  createSupabaseUserClient,
} from "../../config/supabase";

import type {
  SignUpDTO,
  SignInDTO,
  ChangePasswordDTO,
  RequestMeta,
  TokenPair,
} from "./auth.types";

import {
  signUpWithAuth,
  signInWithAuth,
  getOAuthUserFromToken,
  updateLastLoginToDB,
  requestPasswordResetFromAuth,
} from "./auth.repository";

import {
  createAccessToken,
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForProfile,
} from "./jwt.service";

import {
  getProfileIfExistFromDB,
  getProfileByIdForAuthFromDB,
  createProfileToDB,
  checkEmailIfExistFromDB,
} from "../profiles/profiles.repository";
import {
  getMembershipForAuthService,
} from "../organizations/organization-members.service";

import { AppError } from "../../middleware/error.middleware";


export const issueSessionService = async (
  profile: any,
  meta: RequestMeta
): Promise<TokenPair> => {
  const membership =
    profile.onboarding_completed
      ? await getMembershipForAuthService(
          profile.id
        )
      : null;

  const accessToken =
    createAccessToken(
      profile,
      membership
    );

  const refreshToken =
    await issueRefreshToken(
      profile.id,
      membership?.org_id ?? null,
      meta
    );

  return {
    accessToken,
    refreshToken,
  };
};

export const reIssueSessionForOnboarding =
  async (
    profile: any,
    meta: RequestMeta
  ): Promise<TokenPair> => {
    const membership =
      await getMembershipForAuthService(
        profile.id
      );

    if (!membership) {
      throw new AppError(
        401,
        "Membership not found"
      );
    }

    const accessToken =
      createAccessToken(
        profile,
        membership
      );

    const refreshToken =
      await issueRefreshToken(
        profile.id,
        membership.org_id,
        meta
      );

    return {
      accessToken,
      refreshToken,
    };
  };

export const getCurrentUserService =
  async (
    userId: string,
    accessToken: string
  ) => {
    if (!userId) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    return getProfileByIdForAuthFromDB(
      userId
    );
  };


export const signUpService = async (
  dto: SignUpDTO
) => {
  const existingProfile =
    await checkEmailIfExistFromDB(
      dto.email
    );

  if (existingProfile) {
    throw new AppError(
      409,
      "Email is already registered"
    );
  }

  return signUpWithAuth(dto);
};

export const oauthLoginService = async (
  supabaseAccessToken: string,
  meta: RequestMeta
) => {
  const user =
    await getOAuthUserFromToken(
      supabaseAccessToken
    );

  if (!user.email) {
    throw new AppError(
      400,
      "Email is required"
    );
  }

  let profile =
    await getProfileIfExistFromDB(
      user.id
    );

  let needsOnboarding = false;

  if (!profile) {
    const fullName =
      user.user_metadata?.full_name ??
      "";

    const nameParts =
      fullName
        .trim()
        .split(/\s+/);

    const firstName =
      nameParts[0] ?? "";

    const lastName =
      nameParts
        .slice(1)
        .join(" ");

    profile =
      await createProfileToDB({
        id: user.id,
        email: user.email,
        first_name: firstName,
        last_name: lastName,
        avatar_url:
          user.user_metadata?.avatar_url ??
          null,
      });

    needsOnboarding = true;
  } else {
    needsOnboarding =
      !profile.onboarding_completed;

    if (!needsOnboarding) {
      profile =
        await getProfileByIdForAuthFromDB(
          profile.id
        );
    }
  }

  const tokens =
    await issueSessionService(
      profile,
      meta
    );

  await updateLastLoginToDB(
    user.id
  );

  return {
    profile,
    needsOnboarding,
    tokens,
  };
};


export const demoLoginService =
  async (
    meta: RequestMeta
  ) => {
    const auth =
      await signInWithAuth({
        email:
          process.env.DEMO_EMAIL!,
        password:
          process.env.DEMO_PASSWORD!,
      });

    if (!auth?.user) {
      throw new AppError(
        401,
        "Demo login failed"
      );
    }

    const userId =
      auth.user.id;

    const userEmail =
      auth.user.email;

    if (!userEmail) {
      throw new AppError(
        400,
        "Demo account email is required"
      );
    }

    const profile =
      await getProfileIfExistFromDB(
        userId
      );

    if (!profile) {
      throw new AppError(
        404,
        "Demo account profile not found"
      );
    }

    if (!profile.onboarding_completed) {
      throw new AppError(
        403,
        "Demo account is not fully configured"
      );
    }

    const tokens =
      await issueSessionService(
        profile,
        meta
      );

    await updateLastLoginToDB(
      userId
    );

    return {
      profile,
      needsOnboarding: false,
      tokens,
    };
  };

export const signInService = async (
  credentials: SignInDTO,
  meta: RequestMeta
) => {
  const auth =
    await signInWithAuth(
      credentials
    );

  if (!auth?.user) {
    throw new AppError(
      401,
      "Invalid credentials"
    );
  }

  const userId =
    auth.user.id;

  const userEmail =
    auth.user.email;

  if (!userEmail) {
    throw new AppError(
      400,
      "Email is required"
    );
  }

  let profile =
    await getProfileIfExistFromDB(
      userId
    );

  let needsOnboarding = false;

  if (!profile) {
    profile =
      await createProfileToDB({
        id: userId,
        email: userEmail,
      });

    needsOnboarding = true;
  } else {
    needsOnboarding =
      !profile.onboarding_completed;
  }

  const tokens =
    await issueSessionService(
      profile,
      meta
    );

  void updateLastLoginToDB(
    userId
  ).catch((err) => {
    console.error(
      "Failed to update last login:",
      err
    );
  });

  return {
    profile,
    needsOnboarding,
    tokens,
  };
};


export const changePasswordService =
  async (
    userId: string,
    accessToken: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> => {
    if (
      !userId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized"
      );
    }

    if (
      !currentPassword ||
      !newPassword
    ) {
      throw new AppError(
        400,
        "Current password and new password are required"
      );
    }

    const profile =
      await getProfileIfExistFromDB(
        userId
      );

    if (!profile?.email) {
      throw new AppError(
        404,
        "Profile email not found"
      );
    }

    const db =
      createSupabaseUserClient(
        accessToken
      );

    const {
      error: verifyError,
    } = await db.auth.signInWithPassword({
      email: profile.email,
      password: currentPassword,
    });

    if (verifyError) {
      throw new AppError(
        401,
        "Current password is incorrect"
      );
    }

    const { error } =
      await db.auth.updateUser({
        password: newPassword,
      });

    if (error) {
      throw new AppError(
        500,
        `Failed to update password: ${error.message}`
      );
    }

    await revokeAllForProfile(
      userId
    );
  };


export const refreshTokenService =
  async (
    rawRefreshToken: string,
    meta: RequestMeta
  ): Promise<TokenPair> => {
    if (!rawRefreshToken) {
      throw new AppError(
        401,
        "Refresh token missing"
      );
    }

    const {
      newRawToken,
      profileId,
    } = await rotateRefreshToken(
      rawRefreshToken,
      meta
    );

    const profile =
      await getProfileByIdForAuthFromDB(
        profileId
      );

    const membership =
      profile.onboarding_completed
        ? await getMembershipForAuthService(
            profile.id
          )
        : null;

    if (
      profile.onboarding_completed &&
      !membership
    ) {
      throw new AppError(
        403,
        "Organization membership not found"
      );
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


export const refreshUserSessionService =
  async (
    userId: string,
    meta: RequestMeta
  ) => {
    const profile =
      await getProfileByIdForAuthFromDB(
        userId
      );

    const tokens =
      await reIssueSessionForOnboarding(
        profile,
        meta
      );

    return {
      profile,
      tokens,
    };
  };


export const signOutService =
  async (
    rawRefreshToken?: string
  ): Promise<void> => {
    if (rawRefreshToken) {
      await revokeRefreshToken(
        rawRefreshToken
      );
    }
  };


export const signOutAllSessionsService =
  async (
    profileId: string
  ): Promise<void> => {
    await revokeAllForProfile(
      profileId
    );
  };


export const requestPasswordResetService =
  async (
    email: string
  ): Promise<void> => {
    await requestPasswordResetFromAuth(
      email
    );
  };