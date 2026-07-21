import { supabaseAdmin } from '../config/supabase';
import type { AddContact, Contact, ContactCareer, ContactListItem, ContactSocials, ContactStatus, UpdateContact } from '../types/contact';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';

const tab = table.contacts;
const fkey = 'contacts_owner_id_fkey';
const selectAllWithOwner = `*, owner:profiles!${fkey} (
        id,
        first_name,
        last_name )`

const all = selectAllWithOwner;

export const getContactsFromDB = async (orgId: string ): Promise<Contact[]> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('first_name', { ascending: true })

    if (error) {
      throw new AppError(500, `Failed to fetch Contacts: ${error.message}`);
    }
  return data ?? [];
}

export const getContactsListsFromDB = async (orgId: string ): Promise<ContactListItem[]> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select(all)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('first_name', { ascending: true })

    if (error) {
      throw new AppError(500, `Failed to fetch Contacts: ${error.message}`);
    }
  return data ?? [];
}

export const getContactByIDFromDB = async (id: string, orgId: string ): Promise<ContactListItem> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select(all)
      .eq('id', id)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .single()

    if (error) {
      throw new AppError(500, `Failed to fetch Contact: ${error.message}`);
    }
  return data;
}

export const addContactToDB = async (
  orgId: string,
  userId: string,
  contact: AddContact
) : Promise<ContactListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert([{
        ...contact,
        org_id: orgId,
        owner_id: userId,
        status: "Contacted"
      }])
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to add Contact: ${error.message}`);
    }
  return data;
}

export const addContactFromLeadsToDB = async (
  orgId: string,
  userId: string,
  contact: AddContact
) : Promise<ContactListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert([{
        ...contact,
        org_id: orgId,
        owner_id: userId,
        updated_by: userId,
        status: 'Contacted'
      }])
       .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to add Contact: ${error.message}`);
    }
  return data;
}

export const updateContactFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  contact: UpdateContact
) : Promise<ContactListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update([{
        ...contact,
        updated_by: userId
      }])
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Contact: ${error.message}`);
    }
  return data;
}

export const updateContactStatusFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  status: ContactStatus
) : Promise<ContactListItem> => {
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
      throw new AppError(500, `Failed to update Contact Status: ${error.message}`);
    }
  return data;
}

export const updateContactSocialsFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  socials: ContactSocials
) : Promise<ContactListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update({
        ...socials,
        updated_by: userId
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Contact Socials: ${error.message}`);
    }
  return data;
}

export const updateContactCareerFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  career: ContactCareer
) : Promise<ContactListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update({
        ...career,
        updated_by: userId
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Contact Career: ${error.message}`);
    }
  return data;
}



export const deleteContactFromDB = async (
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
      throw new AppError(500, `Failed to delete Contact: ${error.message}`);
    }
  return id;
}

export const deleteBulkContactsFromDB = async (
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
      .in('id', ids)
      .eq('org_id', orgId)

    if (error) {
      throw new AppError(500, `Failed to delete Contact: ${error.message}`);
    }
  return ids;
}