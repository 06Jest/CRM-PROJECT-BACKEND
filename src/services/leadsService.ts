import { supabaseAdmin } from '../utils/supabase';
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
  userName: string,
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
        owner_name: userName,
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
      .select()
      .single()

    if (error) {
      throw new Error(error.message);
    }
  return data;
}

export const deleteLeadFromDB = async (
  id: string,
  userId: string
) : Promise<string> => {
  const { error } = await supabaseAdmin
      .from('leads')
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id)

    if (error) {
      throw new Error(error.message);
    }
  return id;
}