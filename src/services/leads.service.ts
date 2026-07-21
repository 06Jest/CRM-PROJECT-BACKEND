import { supabaseAdmin } from '../config/supabase';
import type { AddLead, Lead, LeadListItem, LeadStatus, UpdateLead } from '../types/lead';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';

const tab = table.leads;
const fkey = 'leads_owner_id_fkey';
const selectAllWithOwner = `*, owner:profiles!${fkey} (
        id,
        first_name,
        last_name )`

const all = selectAllWithOwner;

export const getLeadsFromDB = async (orgId: string ): Promise<Lead[]> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('first_name', { ascending: true })

    if (error) {
      throw new AppError(500, `Failed to fetch Leads: ${error.message}`);
    }
  return data ?? [];
}

export const getLeadsListsFromDB = async (orgId: string ): Promise<LeadListItem[]> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select(all)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('first_name', { ascending: true })

    if (error) {
      throw new AppError(500, `Failed to fetch Leads: ${error.message}`);
    }
  return data ?? [];
}

export const getLeadByIDFromDB = async (id: string, orgId: string ): Promise<LeadListItem> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select(all)
      .is('deleted_at', null)
      .eq('id', id)
      .eq('org_id', orgId)
      .single()

    if (error) {
      throw new AppError(500, `Failed to fetch Lead: ${error.message}`);
    }
  return data;
}

export const addLeadToDB = async (
  orgId: string,
  userId: string,
  lead: AddLead
) : Promise<LeadListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert([{
        ...lead,
        org_id: orgId,
        owner_id: userId,
        updated_by: userId,
      }])
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to add Lead: ${error.message}`);
    }
  return data;
}

export const updateLeadFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  lead: UpdateLead
) : Promise<LeadListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update([{
        ...lead,
        updated_by: userId
      }])
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Lead: ${error.message}`);
    }
  return data;
}

export const updateLeadStatusFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  status: LeadStatus
) : Promise<LeadListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update({
        status: status,
        updated_by: userId
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Lead Status: ${error.message}`);
    }
  return data;
}

export const deleteLeadFromDB = async (
  id: string,
  orgId: string,
  userId: string
) : Promise<string> => {
  const { error } = await supabaseAdmin
      .from(tab)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      throw new AppError(500, `Failed to delete Lead: ${error.message}`);
    }
  return id;
}