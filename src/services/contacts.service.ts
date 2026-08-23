import { createSupabaseUserClient } from '../config/supabase';
import type { 
  AddContact, 
  Contact, 
  ContactCareer, 
  ContactListItem, 
  ContactPersonal, 
  ContactSocials, 
  ContactStatus,  
} from '../types/contact';

import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';
import { PreferredTime, Priority, Source } from '../types/global';

const tab = table.contacts;
const fkey = 'contacts_owner_id_fkey';
const selectAllWithOwner = `
  *,
  owner:organization_members!${fkey} (
    id,
     profile:profiles(
      first_name,
      last_name,
      avatar_url
    )
  )
`;
const all = selectAllWithOwner;

export const getContactsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<Contact[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('first_name', { ascending:true });


  if(error){
    throw new AppError(
      500,
      `Failed to fetch Contacts: ${error.message}`
    );
  }


  return data ?? [];
}



export const getContactsListsFromDB = async (
  orgId:string,
  accessToken:string
):Promise<ContactListItem[]> => {


  const db = createSupabaseUserClient(accessToken);


  const {data,error} = await db
    .from(tab)
    .select(all)
    .eq('org_id',orgId)
    .is('deleted_at',null)
    .order('first_name',{ascending:true});


  if(error){
    throw new AppError(
      500,
      `Failed to fetch Contacts: ${error.message}`
    );
  }


  return data ?? [];
}



export const getContactByIDFromDB = async (
  id:string,
  orgId:string,
  accessToken:string
):Promise<ContactListItem> => {


  const db = createSupabaseUserClient(accessToken);


  const {data,error} = await db
    .from(tab)
    .select(all)
    .eq('id',id)
    .eq('org_id',orgId)
    .is('deleted_at',null)
    .single();


  if(error){
    throw new AppError(
      500,
      `Failed to fetch Contact: ${error.message}`
    );
  }


  return data;
}



export const addContactToDB = async (
  orgId:string,
  memberId:string,
  contact:AddContact,
  accessToken:string
):Promise<ContactListItem> => {


  const db = createSupabaseUserClient(accessToken);


  const {data,error} = await db
    .from(tab)
    .insert([{
      ...contact,
      org_id:orgId,
      owner_id:memberId,
      status:"Contacted"
    }])
    .select(all)
    .single();


  if(error){
    throw new AppError(
      500,
      `Failed to add Contact: ${error.message}`
    );
  }


  return data;
}



export const addContactFromLeadsToDB = async (
  orgId:string,
  memberId:string,
  contact:AddContact,
  accessToken:string
):Promise<ContactListItem> => {


  const db = createSupabaseUserClient(accessToken);


  const {data,error} = await db
    .from(tab)
    .insert([{
      ...contact,
      org_id:orgId,
      owner_id:memberId,
      updated_by:memberId,
      status:'Contacted'
    }])
    .select(all)
    .single();


  if(error){
    throw new AppError(
      500,
      `Failed to add Contact: ${error.message}`
    );
  }


  return data;
}

export const updateContactPersonalFromDB = async (
  id:string,
  orgId:string,
  memberId:string,
  personal:ContactPersonal,
  accessToken:string
):Promise<ContactListItem> => {
  const db = createSupabaseUserClient(accessToken);
  const {data,error} = await db
    .from(tab)
    .update({
      ...personal,
      updated_by:memberId
    })
    .eq('id',id)
    .eq('org_id',orgId)
    .select(all)
    .single();


  if(error){
    throw new AppError(
      500,
      `Failed to update Contact: ${error.message}`
    );
  }

  return data;
}

export const updateContactSocialsFromDB = async (
  id:string,
  orgId:string,
  memberId:string,
  socials:ContactSocials,
  accessToken:string
):Promise<ContactListItem> => {
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

export const updateContactCareerFromDB = async (
  id:string,
  orgId:string,
  memberId:string,
  career:ContactCareer,
  accessToken:string
):Promise<ContactListItem> => {
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

export const updateContactStatusFromDB = async (
  id:string,
  orgId:string,
  memberId:string,
  status:ContactStatus,
  accessToken:string
):Promise<ContactListItem> => {
  const db = createSupabaseUserClient(accessToken);
  const {data,error} = await db
    .from(tab)
    .update({
      status,
      updated_by:memberId
    })
    .eq('id',id)
    .eq('org_id',orgId)
    .select(all)
    .single();

  if(error){
    throw new AppError(
      500,
      `Failed to update Contact Status: ${error.message}`
    );
  }
  return data;
}

export const updateContactSourceFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  source: Source,
  accessToken: string
) : Promise<ContactListItem> => {
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
      throw new AppError(500, `Failed to update Contact Source: ${error.message}`);
    }
  return data;
}

export const updateContactPriorityFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  priority: Priority,
  accessToken: string
) : Promise<ContactListItem> => {
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
      throw new AppError(500, `Failed to update Contact Priority: ${error.message}`);
    }
  return data;
}

export const updateContactNotesFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  notes: string,
  accessToken: string
) : Promise<ContactListItem> => {
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
      throw new AppError(500, `Failed to update Contact Notes: ${error.message}`);
    }
  return data;
}

export const updateContactPreferredTmeFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  preferredTime: PreferredTime,
  accessToken: string
) : Promise<ContactListItem> => {
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
      throw new AppError(500, `Failed to update Contact prefered time: ${error.message}`);
    }
  return data;
}

export const deleteContactFromDB = async (
  id:string,
  orgId:string,
  memberId:string,
  accessToken:string
):Promise<string> => {
  const db = createSupabaseUserClient(accessToken);
  const {error} = await db
    .from(tab)
    .update({
      deleted_at:new Date().toISOString(),
      deleted_by:memberId
    })
    .eq('id',id)
    .eq('org_id',orgId);

  if(error){
    throw new AppError(
      500,
      `Failed to delete Contact: ${error.message}`
    );
  }
  return id;
}

export const deleteBulkContactsFromDB = async (
  ids:string[],
  orgId:string,
  memberId:string,
  accessToken:string
):Promise<string[]> => {
  const db = createSupabaseUserClient(accessToken);
  const {error} = await db
    .from(tab)
    .update({
      deleted_at:new Date().toISOString(),
      deleted_by:memberId
    })
    .in('id',ids)
    .eq('org_id',orgId);

  if(error){
    throw new AppError(
      500,
      `Failed to delete Contacts: ${error.message}`
    );
  }
  return ids;
}