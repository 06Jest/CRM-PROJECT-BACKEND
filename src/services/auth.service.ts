import { createSupabaseClient, supabaseAdmin } from "../config/supabase";
import type { 
  SignUpDTO, 
  SignInDTO,
  ChangePasswordDTO,
} from '../types/auth';
import { AppError } from '../middleware/error.middleware';
import { createAccessToken } from "./jwt.service";
import {
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForProfile,
} from "./jwt.service";
import { RequestMeta, TokenPair } from '../types/auth'
import { getProfileByIdFromDB } from "./profiles.service";




export const signUpWithAuth = async (dto: SignUpDTO) => {
  const db = createSupabaseClient();

  const { error } =
    await db.auth.signUp({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
      options: {
        data: {
          first_name: dto.first_name,
          last_name: dto.last_name,
          org_name: dto.org_name
        }
      }
    });
  if (error) {
    throw new AppError(400, `Failed to create account: ${error.message}`);
  }
}

export const signInWithAuth = async (
  dto: SignInDTO
) => {
  const db = createSupabaseClient();
  

    const { data, error } = await db.auth.signInWithPassword({
      email: dto.email.trim().toLowerCase(),
      password: dto.password,
    });

    if (error) {
      throw new AppError(400, `Failed to log in: ${error.message}`);
    }
    
  return data ;
}


export const newRefresh = async (
  rawRefreshToken: string,
  meta: RequestMeta
): Promise<TokenPair> => {


  const { newRawToken, orgId,  profileId } = await rotateRefreshToken(
    rawRefreshToken,
    meta,
  );

  const profile = await getProfileByIdFromDB(profileId, orgId)

  const accessToken = createAccessToken(profile);

  return { accessToken, refreshToken: newRawToken };
}



export const requestPasswordReset = async (email: string): Promise<void> => {
  const db = createSupabaseClient();
  const {error} = await db.auth.resetPasswordForEmail(email);

  if (error) {
    throw new AppError(400, `Failed to request reset password: ${error.message}`);
  }
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

  const { error} = await supabaseAdmin.auth.admin.updateUserById(
    user.id,
    { password: user.new_password }
  );

  if (error) {
    throw new AppError(500, `Failed to update password: ${error.message}`);
  }
  await revokeAllForProfile(user.id);
}


export const signOutFromAuth = async (rawRefreshToken: string): Promise<void> => {
  await revokeRefreshToken(rawRefreshToken);
}

export const signOutAllSessions = async (profileId: string): Promise<void> => {
  await revokeAllForProfile(profileId);
}

