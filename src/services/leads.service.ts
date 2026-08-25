import { createSupabaseUserClient } from '../config/supabase';
import type { AddLead, Lead, LeadPersonal, LeadCareer, LeadListItem, LeadSocials, LeadStatus } from '../types/lead';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';
import { PreferredTime, Priority, Source } from '../types/global';

const tab = table.leads;
const fkey = 'leads_owner_id_fkey';
const selectAllWithOwner = `
    *, 
    owner:organization_members!${fkey} (
      id,
      profile:profiles(
        first_name,
        last_name,
        avatar_url
      )
    )`

const all = selectAllWithOwner;

export const getLeadsFromDB = async (
  accessToken: string
): Promise<Lead[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select("*")
    .is("deleted_at", null);

  if (error) {
    throw new AppError(500, `Failed to fetch Leads: ${error.message}`);
  }
  return data ?? [];
}

export const getLeadsListsFromDB = async (
  orgId: string, 
  accessToken: string
): Promise<LeadListItem[]> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
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

export const getLeadListByIDFromDB = async (
  leadId: string,
  orgId: string, 
  accessToken: string
): Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .select(all)
      .eq('org_id', orgId)
      .eq('id', leadId)
      .is('deleted_at', null)
      .single()

    if (error) {
      throw new AppError(500, `Failed to fetch Lead: ${error.message}`);
    }
  return data;
}

export const getLeadByIDFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
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
  memberId: string,
  lead: AddLead,
  accessToken: string
) : Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .insert([{
        ...lead,
        org_id: orgId,
        owner_id: memberId,
        updated_by: memberId,
      }])
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to add Lead: ${error.message}`);
    }
  return data;
}

export const updateLeadPersonalFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  personal: LeadPersonal,
  accessToken: string
) : Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .update([{
        ...personal,
        updated_by: memberId
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


export const updateLeadSocialsFromDB = async (
  id:string,
  orgId:string,
  memberId:string,
  socials:LeadSocials,
  accessToken:string
):Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
  const {data,error} = await db
    .from(tab)
    .update({
      ...socials,
      updated_by:memberId
    })
    .eq('id',id)
    .eq('org_id',orgId)
    .select(all)
    .single();

  if(error){
    throw new AppError(
      500,
      `Failed to update Contact Socials: ${error.message}`
    );
  }
  return data;
}

export const updateLeadCareerFromDB = async (
  id:string,
  orgId:string,
  memberId:string,
  career:LeadCareer,
  accessToken:string
):Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
  const {data,error} = await db
    .from(tab)
    .update({
      ...career,
      updated_by:memberId
    })
    .eq('id',id)
    .eq('org_id',orgId)
    .select(all)
    .single();

  if(error){
    throw new AppError(
      500,
      `Failed to update Contact Career: ${error.message}`
    );
  }
  return data;
}

export const updateLeadStatusFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  status: LeadStatus,
  accessToken: string
) : Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .update({
        status: status,
        updated_by: memberId
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

export const updateLeadSourceFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  source: Source,
  accessToken: string
) : Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .update({
        source: source,
        updated_by: memberId
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Lead Source: ${error.message}`);
    }
  return data;
}

export const updateLeadPriorityFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  priority: Priority,
  accessToken: string
) : Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .update({
        priority: priority,
        updated_by: memberId
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Lead Priority: ${error.message}`);
    }
  return data;
}

export const updateLeadNotesFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  notes: string,
  accessToken: string
) : Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .update({
        notes: notes,
        updated_by: memberId
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Lead Notes: ${error.message}`);
    }
  return data;
}

export const updateLeadPreferredTimeFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  preferredTime: PreferredTime,
  accessToken: string
) : Promise<LeadListItem> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .update({
        preferred_contact_time: preferredTime,
        updated_by: memberId  
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Lead Preferred contact time: ${error.message}`);
    }
  return data;
}

export const deleteLeadFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) : Promise<string> => {
  const db = createSupabaseUserClient(accessToken);
    const { error } = await db
      .from(tab)
      .update({
        deleted_at: new Date().toISOString(),
        deleted_by: memberId,
      })
      .eq('id', id)
      .eq('org_id', orgId)

    if (error) {
      throw new AppError(500, `Failed to delete Lead: ${error.message}`);
    }
  return id;
}