import { supabaseAdmin } from "../config/supabase";
import { table } from "../config/tables";

import { AppError } from "../middleware/error.middleware";

import type {
  CallListItem,
  CreateCall,
  UpdateCall,
  EndCall,
} from "../types//calls";

const tab = table.calls;

const creatorFKey = "calls_created_by_fkey";
const assignedFKey = "calls_assigned_to_fkey";

const selectAllWithUsers = `
  *,
  creator:profiles!${creatorFKey}(
    id,
    first_name,
    last_name
  ),
  assigned_user:profiles!${assignedFKey}(
    id,
    first_name,
    last_name
  )
`;

const all = selectAllWithUsers;

export const getCallsFromDB = async (
  orgId: string
): Promise<CallListItem[]> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Calls: ${error.message}`
    );
  }

  return data ?? [];

};

export const getCallByIDFromDB = async (
  id: string,
  orgId: string
): Promise<CallListItem> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Call: ${error.message}`
    );
  }

  return data;

};

export const getLeadCallsFromDB = async (
  orgId: string,
  leadId: string
): Promise<CallListItem[]> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Lead Calls: ${error.message}`
    );
  }

  return data ?? [];

};

export const getContactCallsFromDB = async (
  orgId: string,
  contactId: string
): Promise<CallListItem[]> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .eq("contact_id", contactId)
    .is("deleted_at", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Contact Calls: ${error.message}`
    );
  }

  return data ?? [];

};

export const addCallToDB = async (
  orgId: string,
  userId: string,
  call: CreateCall
): Promise<CallListItem> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .insert([
      {
        ...call,
        org_id: orgId,
        created_by: userId,
        assigned_to: call.assigned_to ?? userId,
        status: "scheduled",
        started_at: null,
        direction: 'outbound'
      }])
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to add Call: ${error.message}`
    );
  }

  return data;

};

export const updateCallFromDB = async (
  id: string,
  orgId: string,
  call: UpdateCall
): Promise<CallListItem> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .update(call)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update Call: ${error.message}`
    );
  }

  return data;

};

export const startCallFromDB = async (
  id: string,
  orgId: string
): Promise<CallListItem> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .update({
      status: "active",
      started_at:
        new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to start Call: ${error.message}`
    );
  }

  return data;

};

export const endCallFromDB = async (
  id: string,
  orgId: string,
  call: EndCall
): Promise<CallListItem> => {

  const existing = await getCallByIDFromDB(
    id,
    orgId
  );

  if (!existing.started_at) {
    throw new AppError(
      400,
      "Call has not been started."
    );
  }

  const endedAt = new Date().toISOString();

  const durationSeconds = Math.floor(
    (
      new Date(endedAt).getTime() -
      new Date(existing.started_at).getTime()
    ) / 1000
  );

  const { data, error } = await supabaseAdmin
    .from(tab)
    .update({
      status: "completed",

      outcome: call.outcome,

      notes: call.notes,

      ended_at: endedAt,

      duration_seconds: durationSeconds,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to end Call: ${error.message}`
    );
  }

  return data;

};

export const cancelCallFromDB = async (
  id: string,
  orgId: string
): Promise<CallListItem> => {

  const { data, error } = await supabaseAdmin
    .from(tab)
    .update({
      status: "cancelled",
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to cancel Call: ${error.message}`
    );
  }

  return data;

};

export const deleteCallFromDB = async (
  id: string,
  orgId: string
): Promise<string> => {

  const { error } = await supabaseAdmin
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete Call: ${error.message}`
    );
  }

  return id;

};
