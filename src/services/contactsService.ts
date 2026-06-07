import { supabaseAdmin } from '../utils/supabase';
import type { Contact } from '../types/contact';

export const getContactsFromDB = async (orgId: string ): Promise<Contact[]> => {
    const { data, error } = await supabaseAdmin
      .from('contacts')
      .select('*')
      .eq('org_id', orgId)
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
  contact: Omit<Contact, 'id' | 'created_at'>
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

export const updateContactFromDB = async (
  id: string,
  contact: Omit<Contact, 'id' | 'created_at' | 'owner_id' | 'org_id' | 'owner_name'>
) : Promise<Contact> => {
  const { data, error } = await supabaseAdmin
      .from('contacts')
      .update(contact)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(error.message);
    }
  return data;
}

export const deleteContactFromDB = async (
  id: string
) : Promise<string> => {
  const { error } = await supabaseAdmin
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(error.message);
    }
  return id;
}