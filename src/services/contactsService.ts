import { supabaseAdmin } from '../utils/supabase';
import type { Contact } from '../types/contact';

export const getContactsFromDB = async (orgId: string ): Promise<Contact[]> => {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('first_name', { ascending: true })

    if (error) {
      throw new Error(error.message);
    }
  return data ?? [];
}

export const addContactToDB = async (
  orgId: string,
  userId: string,
  userName: string,
  contact: Omit<Contact, 'id' | 'lead_id' | 'created_at'>
) : Promise<Contact> => {
  const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert([{
        ...contact,
        org_id: orgId,
        owner_id: userId,
        owner_name: userName
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message);
    }
  return data;
}

export const addContactFromLeadsToDB = async (
  orgId: string,
  userId: string,
  userName: string,
  contact: Omit<Contact, 
      'id' | 
      'created_at' | 
      'status' |
      'deleted_at' |
      'deleted_by' |
      'updated_by'
      >
) : Promise<Contact> => {
  const { data, error } = await supabaseAdmin
      .from('contacts')
      .insert([{
        ...contact,
        org_id: orgId,
        owner_id: userId,
        owner_name: userName,
        updated_by: userId,
        status: 'Contacted'
      }])
      .select()
      .single()

    if (error) {
      throw new Error(error.message);
    }
  return data;
}

export const updateContactFromDB = async (
  id: string,
  userId: string,
  contact: Omit<Contact, 
      'id' | 
      'lead_id'| 
      'created_at' | 
      'owner_id' | 
      'org_id' | 
      'owner_name' |
      'deleted_at' |
      'deleted_by' 
  >
) : Promise<Contact> => {
  const { data, error } = await supabaseAdmin
      .from('contacts')
      .update([{
        ...contact,
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

export const deleteContactFromDB = async (
  id: string,
  userId: string
) : Promise<string> => {
  const { error } = await supabaseAdmin
      .from('contacts')
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