import { createSupabaseUserClient } from "../config/supabase";
import { table } from "../config/tables";

import { AppError } from "../middleware/error.middleware";

import type {
  ActivityListItem,
  CreateActivity,
  UpdateActivity,
  ActivityAction,
  ActivityType,
  ManualCreateActivity,
} from "../types/activity";

const tab = table.activities;

const creatorFKey = "activities_created_by_fkey";

const selectAll = `
  *,
  creator:organization_members!${creatorFKey}(
    id,
    profile:profiles(
      first_name,
      last_name,
      avatar_url
    )
  )
`;



export const getActivitiesFromDB = async (
  orgId: string,
  accessToken: string
): Promise<ActivityListItem[]> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Activities: ${error.message}`
    );
  }


  return data ?? [];

};



export const getActivityByIDFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<ActivityListItem> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .select(selectAll)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .single();


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Activity: ${error.message}`
    );
  }


  return data;

};



export const getLeadActivitiesFromDB = async (
  orgId: string,
  leadId: string,
  accessToken: string
): Promise<ActivityListItem[]> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .order("created_at", {
      ascending:false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Lead Activities: ${error.message}`
    );
  }


  return data ?? [];

};



export const getContactActivitiesFromDB = async (
  orgId: string,
  contactId: string,
  accessToken: string
): Promise<ActivityListItem[]> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .eq("contact_id", contactId)
    .is("deleted_at", null)
    .order("created_at", {
      ascending:false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Contact Activities: ${error.message}`
    );
  }


  return data ?? [];

};



export const getCustomerActivitiesFromDB = async (
  orgId: string,
  customerId: string,
  accessToken: string
): Promise<ActivityListItem[]> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .eq("customer_id", customerId)
    .is("deleted_at", null)
    .order("created_at", {
      ascending:false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Customer Activities: ${error.message}`
    );
  }


  return data ?? [];

};

export const getActivitiesByActionFromDB = async (
  orgId: string,
  action: ActivityAction,
  accessToken: string
): Promise<ActivityListItem[]> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .eq("action", action)
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Activities: ${error.message}`
    );
  }


  return data ?? [];

};



export const getActivitiesByTypeFromDB = async (
  orgId: string,
  type: ActivityType,
  accessToken: string
): Promise<ActivityListItem[]> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .eq("type", type)
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Activities: ${error.message}`
    );
  }


  return data ?? [];

};



export const addActivityToDB = async (
  orgId: string,
  memberId: string,
  activity: CreateActivity,
  accessToken: string
): Promise<ActivityListItem> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .insert([
      {
        ...activity,
        org_id: orgId,
        created_by: memberId,
      },
    ])
    .select(selectAll)
    .single();


  if (error) {
    throw new AppError(
      500,
      `Failed to create Activity: ${error.message}`
    );
  }


  return data;

};



export const manualAddActivityToDB = async (
  orgId: string,
  memberId: string,
  activity: ManualCreateActivity,
  accessToken: string
): Promise<ActivityListItem> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .insert([
      {
        ...activity,
        org_id: orgId,
        created_by: memberId,
      },
    ])
    .select(selectAll)
    .single();


  if (error) {
    throw new AppError(
      500,
      `Failed to create Activity: ${error.message}`
    );
  }


  return data;

};



export const updateActivityFromDB = async (
  id: string,
  orgId: string,
  activity: UpdateActivity,
  accessToken: string
): Promise<ActivityListItem> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { data, error } = await supabase
    .from(tab)
    .update(activity)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select(selectAll)
    .single();


  if (error) {
    throw new AppError(
      500,
      `Failed to update Activity: ${error.message}`
    );
  }


  return data;

};



export const deleteActivityFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<string> => {

  const supabase =
    createSupabaseUserClient(accessToken);


  const { error } = await supabase
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId);


  if (error) {
    throw new AppError(
      500,
      `Failed to delete Activity: ${error.message}`
    );
  }


  return id;

};