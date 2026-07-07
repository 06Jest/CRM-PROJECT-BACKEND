import { supabaseAdmin } from '../config/supabase';
import type { Lead } from '../types/lead';

export const getLeadsFromDB = async (orgId: string ): Promise<Lead[]> => {
    const { data, error } = await supabaseAdmin
      .from('leads')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('first_name', { ascending: true })

    if (error) {
      throw new Error(error.message);
    }
  return data ?? [];
}

export const addLeadToDB = async (
  orgId: string,
  userId: string,
  lead: Omit<Lead, 
        'id' | 
        'created_at' | 
        'owner_name'|
        'deleted_at' |
        'deleted_by'  >
) : Promise<Lead> => {
  const { data, error } = await supabaseAdmin
      .from('leads')
      .insert([{
        ...lead,
        org_id: orgId,
        owner_id: userId,
        updated_by: userId,
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message);
    }
  return data;
}

export const updateLeadFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  lead: Omit<Lead, 
  'id' | 
  'created_at' | 
  'owner_id' | 
  'org_id' | 
  'owner_name' |
  'deleted_at' |
  'deleted_by' 
  >
) : Promise<Lead> => {
  const { data, error } = await supabaseAdmin
      .from('leads')
      .update([{
        ...lead,
        updated_by: userId
      }])
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new Error(error.message);
    }
  return data;
}

export const deleteLeadFromDB = async (
  id: string,
  orgId: string,
  userId: string
) : Promise<string> => {
  const { error } = await supabaseAdmin
      .from('leads')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      throw new Error(error.message);
    }
  return id;
}