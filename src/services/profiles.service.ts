import { createSupabaseUserClient, supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import type {
  Profile,
  AddProfileDTO,
  UpdateProfileDTO,
  ProfileStatus,
  DisplayProfile,
  AddAdminProfileDTO,
  ProfileIDName
} from '../types/profile';
import type { Roles } from '../types/global';

import { table } from '../config/tables';

const tab = table.profile;

export const getActiveProfilesFromDB = async (
  orgId: string,
  accessToken: string
): Promise<Profile[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch profiles: ${error.message}`);
  }

  return data ?? [];
};


export const getAllProfilesFromDB = async (
  orgId: string,
  accessToken: string
): Promise<Profile[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch profiles: ${error.message}`);
  }

  return data ?? [];
};


export const getAllAgentsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<Profile[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('org_id', orgId)
    .eq('role', 'agent')
    .is('deleted_at', null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch agents: ${error.message}`);
  }

  return data ?? [];
};


export const getActiveAgentsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<Profile[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('org_id', orgId)
    .eq('role', 'agent')
    .eq('status', 'active')
    .is('deleted_at', null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch agents: ${error.message}`);
  }

  return data ?? [];
};


export const getProfileByIdFromDB = async (
  userId: string,
  orgId: string,
  accessToken: string
): Promise<DisplayProfile> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(`*,
      org:organizations!profiles_org_id_fkey(
        name
      )
      `)
    .eq('id', userId)
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new AppError(500, `Failed to fetch profile: ${error.message}`);
  }

  return data;
};


export const getAllMembersIDNamesFromDB = async (
  orgId: string,
  accessToken: string
): Promise<ProfileIDName[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('id, display_name')
    .eq('org_id', orgId)
    .is('deleted_at', null);

  if (error) {
    throw new AppError(500, `Failed to fetch profile: ${error.message}`);
  }

  return data ?? [];
};


// export const getDisplayProfileFromDB = async (
//   userId: string,
//   orgId: string,
//   accessToken: string
// ): Promise<DisplayProfile> => {

//   const db = createSupabaseUserClient(accessToken);

//   const { data, error } = await db
//     .from(tab)
//     .select(`
//       id,
//       display_name,
//       first_name,
//       last_name,
//       email,
//       avatar_url,
//       org:organizations!profiles_org_id_fkey(
//       id,
//       name
//       )
//     `)
//     .eq('id', userId)
//     .eq('org_id', orgId)
//     .eq('status', 'active')
//     .is('deleted_at', null)
//     .single();

//   if (error) {
//     throw new AppError(500, `Failed to fetch profile: ${error.message}`);
//   }
//   return {
//     ...data,
//     org: data.org?.[0] ?? {
//       id: '',
//       name: '',
//     },
//   };
// };


export const isProfileExistFromDB = async (
  userId: string
): Promise<{
  id: string;
  org_id: string;
} | null> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select('id, org_id')
    .eq('id', userId)
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new AppError(500, `Failed to fetch profile: ${error.message}`);
  }

  return data;
};


export const getProfileByIdAdminFromDB = async (
  userId: string,
  orgId: string
): Promise<Profile> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select('*')
    .eq('id', userId)
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle();

  if (error) {
    throw new AppError(500, `Failed to fetch profile: ${error.message}`);
  }

  return data;
};


export const addAgentProfileToDB = async (
  orgId: string,
  dto: Omit<AddProfileDTO, 'id'>
): Promise<Profile> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .insert([{
      ...dto,
      role: 'agent',
      org_id: orgId,
    }])
    .select()
    .single();

  if (error) {
    throw new AppError(500, `Failed to add profile: ${error.message}`);
  }

  return data;
};


export const addAdminProfileToDB = async (
  dto: AddAdminProfileDTO
): Promise<Profile> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .insert([{
      ...dto,
      role: 'admin',
      status: 'active'
    }])
    .select()
    .single();

  if (error) {
    throw new AppError(500, `Failed to add profile: ${error.message}`);
  }

  return data;
};

export const getProfileByIdForAuthFromDB = async (
  userId: string,
  orgId: string
): Promise<Profile> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select('*')
    .eq('id', userId)
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
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
  orgId: string,
  dto: UpdateProfileDTO,
  accessToken: string
): Promise<Profile> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      ...dto
    })
    .eq('org_id', orgId)
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


export const updateProfileStatusFromDB = async (
  userId: string,
  orgId: string,
  status: ProfileStatus,
  accessToken: string
): Promise<Profile> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status
    })
    .eq('org_id', orgId)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update status: ${error.message}`
    );
  }

  return data;
};


export const updateRoleFromDB = async (
  userId: string,
  orgId: string,
  role: Roles,
  accessToken: string
): Promise<Roles> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      role
    })
    .eq('org_id', orgId)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update role: ${error.message}`
    );
  }

  return data.role;
};


export const updateAvatarFromDB = async (
  userId: string,
  orgId: string,
  avatar_url: string,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      avatar_url
    })
    .eq("org_id", orgId)
    .eq("id", userId)
    .select("avatar_url")
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update avatar: ${error.message}`
    );
  }

  return data.avatar_url;
};


export const deleteProfileFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString()
    })
    .eq('id', id)
    .eq('org_id', orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete profile: ${error.message}`
    );
  }

  return id;
};