import { supabaseAdmin } from '../config/supabase';
import type { AddLead, Lead, UpdateLead } from '../types/lead';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';

const tab = table.leads;

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

export const addLeadToDB = async (
  orgId: string,
  userId: string,
  lead: AddLead
) : Promise<Lead> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert([{
        ...lead,
        org_id: orgId,
        owner_id: userId,
        updated_by: userId,
      }])
      .select()
      .single()

    if (error) {
      throw new AppError(500, `Failed to add Leads: ${error.message}`);
    }
  return data;
}

export const updateLeadFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  lead: UpdateLead
) : Promise<Lead> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update([{
        ...lead,
        updated_by: userId
      }])
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Lead: ${error.message}`);
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