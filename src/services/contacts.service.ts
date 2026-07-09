import { supabaseAdmin } from '../config/supabase';
import type { AddContact, Contact, UpdateContact } from '../types/contact';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';

const tab = table.contacts;

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

export const addContactToDB = async (
  orgId: string,
  userId: string,
  contact: AddContact
) : Promise<Contact> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert([{
        ...contact,
        org_id: orgId,
        owner_id: userId,
      }])
      .select()
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
) : Promise<Contact> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert([{
        ...contact,
        org_id: orgId,
        owner_id: userId,
        updated_by: userId,
        status: 'Contacted'
      }])
      .select()
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
) : Promise<Contact> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update([{
        ...contact,
        updated_by: userId
      }])
      .eq('id', id)
      .eq('org_id', orgId)
      .select()
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Contact: ${error.message}`);
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