import { createSupabaseClient, createSupabaseUserClient, supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import type {
  Profile,
  UpdateProfileDTO,
  DisplayProfile,
  CreateInitialProfileDTO,
  CompleteProfileDTO,
  ProfileStatus
} from '../types/profile';
import type { OnboardingStep, Roles } from '../types/global';
import { table } from '../config/tables';

const tab = table.profile;


export const getProfileIfExistFromDB = async (
  userId: string,
): Promise<Profile | null> => {

  const db = supabaseAdmin

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new AppError(500, `Failed to fetch profile: ${error.message}`);
  }
  return data;
};


export const getProfileByIdFromDB = async (
  userId: string,
  accessToken: string
): Promise<DisplayProfile> => {
  const db = createSupabaseUserClient(accessToken);

    const { data, error } = await db
    .from(tab)
    .select(`
      *,
      membership:organization_members!organization_members_profile_fkey(
        id,
        display_id,
        role,
        status,
        created_at,
        org:organizations!organization_members_org_id_fkey(
          id,
          name,
          display_id,
          logo_url,
          type
        )
      )
    `)
    .eq("id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.log("SUPABASE PROFILE ERROR:", error);
    throw new AppError(
      500,
      error.message
    );
  }

  if (!data) {
    throw new AppError(
      404,
      "Profile not found"
    );
  }

  return data;
};





export const isProfileExistFromDB = async (
  userId: string
): Promise<{
  id: string;
} | null> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select('id')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new AppError(500, `Failed to fetch profile: ${error.message}`);
  }

  return data;
};


export const createProfileToDB = async (
  dto: CreateInitialProfileDTO
): Promise<Profile> => {

  const db = supabaseAdmin;

  const {data,error}=await db
    .from(tab)
    .insert({
      id:dto.id,
      email:dto.email,
      status:"pending",
      onboarding_completed:false,
      onboarding_step:0
    })
    .select()
    .single();


  if(error){
    throw new AppError(
      500,
      error.message
    );
  }

  return data;
};

export const updateProfileSetupToDB = async (
  userId: string,
  dto: CompleteProfileDTO,
  accessToken: string
): Promise<Profile> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      first_name: dto.first_name,
      last_name: dto.last_name,
      avatar_url: dto.avatar_url ?? null,
      job_title: dto.job_title,
      onboarding_step: 1,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to complete profile setup: ${error.message}`
    );
  }

  return data;
};

export const updateOnboardingStepToDB = async (
  userId: string,
  step: OnboardingStep,
  accessToken: string
): Promise<Profile> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      onboarding_step: step,
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update onboarding step: ${error.message}`
    );
  }

  return data;
};

export const completeOnboardingInDB = async (
  userId: string,
  accessToken: string
): Promise<Profile> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      onboarding_step: 4,
      onboarding_completed: true,
      status: "active",
    })
    .eq("id", userId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to complete onboarding: ${error.message}`
    );
  }

  return data;
};


export const getProfileByIdForAuthFromDB = async (
  userId: string,
): Promise<Profile> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select("*")
    .eq("id", userId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch profile: ${error.message}`
    );
  }

  return data;
};

export const updateProfileFromDB = async (
  userId: string,
  dto: UpdateProfileDTO,
  accessToken: string
): Promise<Profile> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      ...dto
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update profile: ${error.message}`
    );
  }
  return data;
};



export const updateProfileAvatarFromDB = async (
  userId: string,
  avatar_url: string,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      avatar_url
    })
    .eq("id", userId)
    .select("avatar_url")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update profile avatar: ${error.message}`
    );
  }
  return data.avatar_url;
};

export const updateProfileStatusFromDB = async (
  userId: string,
  status: ProfileStatus,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status
    })
    .eq("id", userId)
    .select("status")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update profile status: ${error.message}`
    );
  }
  return data.status;
};

export const updateLastLoginToDB = async (
  profileId: string,
  accessToken: string
): Promise<void> => {

  const db =
    createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      last_login: new Date().toISOString(),
    })
    .eq("id", profileId);

  if (error) {
    throw new AppError(
      500,
      `Failed to update last login: ${error.message}`
    );
  }

};

export const deleteProfileFromDB = async (
  id: string,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    throw new AppError(
      500,
      `Failed to delete profile: ${error.message}`
    );
  }

  return id;
};