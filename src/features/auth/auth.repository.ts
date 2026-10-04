import {
  createSupabaseClient,
  supabaseAdmin,
} from "../../config/supabase";

import { table } from "../../config/tables";

import type {
  RequestMeta,
  SignInDTO,
  SignUpDTO,
} from "./auth.types";

import { AppError } from "../../middleware/error.middleware";

export interface StoredRefreshTokenRow {
  id: string;
  profile_id: string;
  org_id: string | null;
  replaced_by_id: string | null;
  token_hash: string;
  expires_at: string;
  revoked_at: string | null;
}

const refreshTable = table.refresh;


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

export const getOAuthUserFromToken = async (
  supabaseAccessToken: string
) => {
  const {
    data: { user },
    error,
  } = await supabaseAdmin.auth.getUser(
    supabaseAccessToken
  );

  if (error || !user) {
    throw new AppError(
      401,
      "Invalid OAuth session"
    );
  }

  return user;
};

export const updateLastLoginToDB = async (
  userId: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(table.profile)
    .update({
      last_login: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) {
    throw error;
  }
};

export const requestPasswordResetFromAuth = async (
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


export const addRefreshTokenToDB = async (
  data: {
    profile_id: string;
    org_id: string | null;
    token_hash: string;
    expires_at: string;
  },
  meta: RequestMeta
) => {
  const { data: newRow, error } =
    await supabaseAdmin
      .from(refreshTable)
      .insert({
        profile_id: data.profile_id,
        org_id: data.org_id,
        token_hash: data.token_hash,
        expires_at: data.expires_at,
        ip_address: meta.ipAddress ?? null,
        user_agent: meta.userAgent ?? null,
        revoked_at: null,
      })
      .select()
      .single();

  if (error || !newRow) {
    throw new Error(
      `Failed to issue rotated token: ${
        error?.message ?? "unknown error"
      }`
    );
  }

  return newRow;
};

export const replaceRefreshTokenInDB = async (
  oldRowId: string,
  newRowId: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(refreshTable)
    .update({
      revoked_at: new Date().toISOString(),
      replaced_by_id: newRowId,
    })
    .eq("id", oldRowId);

  if (error) {
    throw new Error(
      `Failed to update old refresh token: ${error.message}`
    );
  }
};

export const issueRefreshTokenToDB = async (
  data: {
    profileId: string;
    orgId: string | null;
    tokenHash: string;
    expiresAt: string;
  },
  meta: RequestMeta
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(refreshTable)
    .insert({
      profile_id: data.profileId,
      org_id: data.orgId,
      token_hash: data.tokenHash,
      expires_at: data.expiresAt,
      ip_address: meta.ipAddress ?? null,
      user_agent: meta.userAgent ?? null,
    });

  if (error) {
    throw new Error(
      `Failed to store refresh token: ${error.message}`
    );
  }
};

export const updateAccessSessionInDB = async (
  refreshHash: string,
  memberId: string,
  meta: RequestMeta
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(refreshTable)
    .update({
      ip_address: meta.ipAddress,
      user_agent: meta.userAgent,
      last_seen_at: new Date().toISOString(),
    })
    .eq("token_hash", refreshHash)
    .eq("profile_id", memberId);

  if (error) {
    throw error;
  }
};

export const getRefreshDataByHashFromDB = async (
  refreshHash: string
): Promise<StoredRefreshTokenRow> => {
  const {
    data,
    error,
  } = await supabaseAdmin
    .from(refreshTable)
    .select("*")
    .eq("token_hash", refreshHash)
    .single();

  if (!data) {
    throw new Error(
      "Refresh token not recognized"
    );
  }

  if (error) {
    throw new Error(
      `Lookup failed: ${error.message}`
    );
  }

  return data as StoredRefreshTokenRow;
};

export const revokeRefreshTokenInDB = async (
  tokenHash: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(refreshTable)
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq("token_hash", tokenHash)
    .is("revoked_at", null)
    .select();

  if (error) {
    throw new Error(
      `Failed to revoke token: ${error.message}`
    );
  }
};

export const revokeAllForProfileInDB = async (
  profileId: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(refreshTable)
    .update({
      revoked_at: new Date().toISOString(),
    })
    .eq("profile_id", profileId)
    .is("revoked_at", null);

  if (error) {
    throw new Error(
      `Failed to revoke sessions: ${error.message}`
    );
  }
};