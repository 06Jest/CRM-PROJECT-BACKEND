import { createSupabaseClient, supabaseAdmin } from "../config/supabase";
import type { 
  SignUpDTO, 
  SignInDTO,
  ChangePasswordDTO
} from '../types/auth';
import { AppError } from '../middleware/error.middleware';
import { createAccessToken } from "../services/jwt.service";
import {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForProfile,
} from "../services/refresh.service";
import { RequestMeta, TokenPair } from '../types/auth'


export const signUpWithAuth = async (dto: SignUpDTO) => {
  const db = createSupabaseClient();

  const { data, error } =
    await db.auth.signUp({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      options: {
        data: {
          first_name: dto.first_name,
          last_name: dto.last_name,
          organization_name: dto.org_name
        }
      }
    });
  if (error) {
    throw new AppError(400, error.message);
  }
  return data;
}

export const signInWithAuth = async (
  dto: SignInDTO
) => {
  const db = createSupabaseClient();

    const { data, error } = await db.auth.signInWithPassword({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    })

    if (error) {
      throw new AppError(400,error.message);
    }
    
  return data ;
}

export const refresh = async (
  rawRefreshToken: string,
  meta: RequestMeta = {}
): Promise<TokenPair> => {
  const { profileId, rawRefreshToken: newRefreshToken } = await rotateRefreshToken(
    rawRefreshToken,
    meta
  );

  const { data: profileRow, error } = await supabaseAdmin
    .from("profiles")
    .select("id, org_id, role")
    .eq("id", profileId)
    .maybeSingle();

  if (error || !profileRow) {
    throw new AppError(401,"Account no longer exists");
  }

  const accessToken = createAccessToken({
    sub: profileRow.id,
    role: profileRow.role,
    orgId: profileRow.org_id,
  });
  return { accessToken, refreshToken: newRefreshToken };
}

export const requestPasswordReset = async (email: string): Promise<void> => {
  const db = createSupabaseClient();
  await db.auth.resetPasswordForEmail(email);
}

export const changePasswordFromAuth = async (user: ChangePasswordDTO): Promise<void> => {
  const db = createSupabaseClient();
  const { error: verifyError } = await db.auth.signInWithPassword({
    email: user.email,
    password: user.current_password,
  });

  if (verifyError) {
    throw new AppError(401, "Current password is incorrect");
  }

  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: user.new_password }
  );

  if (updateError) {
    throw new AppError(500, `Failed to update password: ${updateError.message}`);
  }
  await revokeAllForProfile(user.id);
}


export const signOutFromAuth = async (rawRefreshToken: string): Promise<void> => {
  try {
    await revokeRefreshToken(rawRefreshToken);
  } catch {
  }
}

export const signOutAllSessions = async (profileId: string): Promise<void> => {
  await revokeAllForProfile(profileId);
}

