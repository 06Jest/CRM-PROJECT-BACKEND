import { supabaseAdmin } from '../config/supabase';
import type { AddDeal, Deal, DealListItem, DealStage, UpdateDeal } from '../types/deal';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';

const tab = table.deals;
const fkey = 'deals_owner_id_fkey';
const selectAllWithOwner = `*, owner:profiles!${fkey} (
        id,
        first_name,
        last_name )`

const all = selectAllWithOwner;

export const getDealsFromDB = async (orgId: string ): Promise<Deal[]> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)

    if (error) {
      throw new AppError(500, `Failed to fetch Deal: ${error.message}`);
    }
  return data ?? [];
}

export const getDealsListsFromDB = async (orgId: string ): Promise<DealListItem[]> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select(all)
      .eq('org_id', orgId)
      .is('deleted_at', null)

    if (error) {
      throw new AppError(500, `Failed to fetch Deal: ${error.message}`);
    }
  return data as DealListItem[];
}

export const getDealsByIDFromDB = async (id: string, orgId: string ): Promise<DealListItem> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select(all)
      .eq('id', id)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .single()

    if (error) {
      throw new AppError(500, `Failed to fetch Deal: ${error.message}`);
    }
  return data as DealListItem;
}

export const addDealToDB = async (
  orgId: string,
  userId: string,
  deal: AddDeal
) : Promise<DealListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert([{
        ...deal,
        org_id: orgId,
        owner_id: userId,
        updated_by: userId,
      }])
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to add Deal: ${error.message}`);
    }
  return data as DealListItem;
}

export const updateDealFromDB = async (
  id: string,
  userId: string,
  deal: UpdateDeal,
  orgId: string
) : Promise<DealListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update([{
        ...deal,
        updated_by: userId  
      }])
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Deal: ${error.message}`);
    }
  return data as DealListItem;
}

export const updateDealStageFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  stage: DealStage
) : Promise<DealListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update({
        stage: stage,
        updated_by: userId
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Deal Stage: ${error.message}`);
    }
  return data as DealListItem;
}

export const closeDealFromDB = async (
  id: string,
  outcome: 'Closed Won' | 'Closed Lost',  
  userId: string,
  orgId: string
) : Promise<DealListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update([{
        stage: outcome,
        updated_by: userId,
        close_date: new Date().toISOString(),
        closed_by: userId,
      }])
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to close Deal: ${error.message}`);
    }
  return data;
}

export const deleteDealFromDB = async (
  id: string,
  userId: string
) : Promise<string> => {
  const { error } = await supabaseAdmin
      .from(tab)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .eq('id', id)

    if (error) {
      throw new AppError(500, `Failed to delete Deal: ${error.message}`);
    }
  return id;
}

export const deleteAllDealsByContactIDFromDB = async (
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
      .eq('contact_id', id)
      .eq('org_id', orgId)

    if (error) {
      throw new AppError(500, `Failed to delete Contact: ${error.message}`);
    }
  return id;
}

export const deleteAllDealsByBulkContactsFromDB = async (
  ids: string[],
  orgId: string,
  userId: string
) : Promise<string[]> => {
  const { error } = await supabaseAdmin
      .from(tab)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: userId,
      })
      .in('contact_id', ids)
      .eq('org_id', orgId)

    if (error) {
      throw new AppError(500, `Failed to delete Contact: ${error.message}`);
    }
  return ids;
}