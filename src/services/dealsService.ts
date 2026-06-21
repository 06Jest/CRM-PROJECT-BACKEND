import { supabaseAdmin } from '../utils/supabase';
import type { Deal } from '../types/deal';

export const getDealsFromDB = async (orgId: string ): Promise<Deal[]> => {
    const { data, error } = await supabaseAdmin
      .from('deals')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)

    if (error) {
      throw new Error(error.message);
    }
  return data ?? [];
}

export const addDealToDB = async (
  orgId: string,
  userId: string,
  userName: string,
  deal: Omit<Deal, 
        'id' | 
        'created_at' |
        'owner_name' |
        'deleted_at' |
        'deleted_by' |
        'close_date' |
        'closed_by'
        >
) : Promise<Deal> => {
  const { data, error } = await supabaseAdmin
      .from('deals')
      .insert([{
        ...deal,
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

export const updateDealFromDB = async (
  id: string,
  userId: string,
  deal: Omit<Deal, 
  'id' | 
  'created_at' |
  'contact_id' |
  'owner_id' | 
  'org_id' | 
  'owner_name' |
  'deleted_at' |
  'deleted_by' |
  'close_date' |
  'closed_by'
  >
) : Promise<Deal> => {
  const { data, error } = await supabaseAdmin
      .from('deals')
      .update([{
        ...deal,
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

export const closeDealFromDB = async (
  id: string,
  outcome: 'Closed Won' | 'Closed Lost',
  userId: string,
  deal: Omit<Deal, 
  'id' | 
  'created_at' |
  'contact_id' |
  'owner_id' | 
  'org_id' | 
  'owner_name' |
  'deleted_at' |
  'deleted_by' 
  >
) : Promise<Deal> => {
  const { data, error } = await supabaseAdmin
      .from('deals')
      .update([{
        ...deal,
        stage: outcome,
        updated_by: userId,
        close_date: new Date().toISOString(),
        closed_by: userId,
      }])
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message);
    }
  return data;
}

export const deleteDealFromDB = async (
  id: string,
  userId: string
) : Promise<string> => {
  const { error } = await supabaseAdmin
      .from('deals')
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