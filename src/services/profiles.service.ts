import {  supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import type { 
  Profile,
  Role,
  AddProfileDTO, 
  UpdateProfileDTO,
  ProfileStatus,
  ProfileName,
  DisplayProfile
 } from '../types/profile';

export const getActiveProfilesFromDB = async (orgId: string ): Promise<Profile[]> => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(500, "Failed to fetch profiles");
    }
  return data ?? [];
}

export const getAllProfilesFromDB = async (orgId: string ): Promise<Profile[]> => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(500, "Failed to fetch profiles");
    }
  return data ?? [];
}

export const getAllSubscribersFromDB = async () : 
  Promise<Profile[]> => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(500, "Failed to fetch profiles");
    }
  return data ?? [];
}
export const getActiveSubscribersFromDB = async () : 
  Promise<Profile[]> => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(500, "Failed to fetch profiles");
    }
  return data ?? [];
}

export const getAdminCountFromDB = async (orgId: string) : 
  Promise<Profile[]> => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .eq('org_id', orgId)
      .eq('status', 'active')
      .is('deleted_at', null)
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(500, "Failed to fetch profiles");
    }
  return data ?? [];
}

export const getAllAgentsFromDB = async (orgId: string) : 
  Promise<Profile[]> => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('org_id', orgId)
      .eq('role', 'agent')
      .is('deleted_at', null)
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(500, "Failed to fetch profiles");
    }
  return data ?? [];
}

export const getActiveAgentsFromDB = async (orgId: string) : 
  Promise<Profile[]> => {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('org_id', orgId)
      .eq('role', 'agent')
      .eq('status', 'active')
      .is('deleted_at', null)
      .order("created_at", { ascending: false })

    if (error) {
      throw new AppError(500, "Failed to fetch profiles");
    }
  return data ?? [];
}

export const isProfileExistFromDB = async ( userId: string ): 
  Promise<{
    id: string, 
    org_id: string
  }> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('id, org_id')
    .eq('id', userId)
    .is('deleted_at', null)
    .single()

  if (error) {
    throw new AppError(500, "Failed to fetch profiles");
  }
  return data;
}

export const getProfileByIdFromDB = async ( userId: string, orgId: string ): 
  Promise<Profile> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .maybeSingle()

  if (error) {
    throw new AppError(500, "Failed to fetch profiles");
  }
  return data;
}

export const getProfileNameFromDB = async ( userId: string, orgId: string ): 
  Promise<ProfileName> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name')
    .eq('id', userId)
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .single()

  if (error) {
    throw new AppError(500, "Failed to fetch profiles");
  }
  return data ?? [];
}

export const getDisplayProfileFromDB = async ( userId: string, orgId: string ): 
  Promise<DisplayProfile> => {
  const { data, error } = await supabaseAdmin
    .from('profiles')
    .select('first_name, last_name, display_name, email, employee_id, position, avatar_url')
    .eq('id', userId)
    .eq('org_id', orgId)
    .eq('status', 'active')
    .is('deleted_at', null)
    .single()

  if (error) {
    throw new AppError(500, "Failed to fetch profiles");
  }
  return data ?? [];
}

export const addAgentProfileToDB = async (  
  orgId: string,
  dto: Omit<AddProfileDTO, 'id'>
) : Promise<Profile> => {
  const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert([{
        ...dto,
        role: 'agent',
        org_id: orgId,
      }])
      .select()
      .single()

    if (error) {
      throw new AppError(500, "Failed to add profile");
    }
  return data;
}

export const addAdminProfileToDB = async (
  dto: Omit<AddProfileDTO, 'phone, position'>
) : Promise<Profile> => {
  const { data, error } = await supabaseAdmin
      .from('profiles')
      .insert([{
        ...dto,
        role: 'admin'
      }])
      .select()
      .single()

    if (error) {
      throw new AppError(500, "Failed to add profile");
    }
  return data;
}


export const updateProfileFromDB = async (
  userId: string,
  orgId: string,
  dto: UpdateProfileDTO
) : Promise<Profile> => {
  const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({...dto})
      .eq('org_id', orgId)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new AppError(500, "Failed to update profile");
    }
  return data;
}

export const updateProfileStatusFromDB = async (
  userId: string,
  orgId: string,
  status: ProfileStatus
) : Promise<Profile> => {
  const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({status: status})
      .eq('org_id', orgId)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new AppError(500, "Failed to update status");
    }
  return data;
}

export const updateRoleFromDB = async (
  userId: string,
  orgId: string,
  role: Role
) : Promise<Role> => {
  const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({role: role})
      .eq('org_id', orgId)
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new AppError(500, "Failed to update status");
    }
  return data.role;
}

export const updateAvatarFromDB = async (
  userId: string,
  orgId: string,
  avatar_url: string
): Promise<string> => {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .update({ avatar_url })
    .eq("org_id", orgId)
    .eq("id", userId)
    .select("avatar_url")
    .single();

  if (error) {
    throw new AppError(500, "Failed to update avatar.");
  }

  return data.avatar_url;
};

export const deleteProfileFromDB = async (
  id: string,
  orgId: string
) : Promise<string> => {
  const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        deleted_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      throw new AppError(500, "Failed to delete profile");
    }
  return id;
}

