import { supabaseAdmin } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';
import { Customer, CustomerListItem, CustomerStatus } from '../types/customer';

const tab = table.customers;
const fkey = 'fk_customer_owner';
const selectAllWithOwner = `*, owner:profiles!${fkey} (
        id,
        first_name,
        last_name )`
const all = selectAllWithOwner;


export const getCustomersFromDB = async (orgId: string ): Promise<Customer[]> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select('*')
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .order('first_name', { ascending: true })

    if (error) {
      throw new AppError(500, `Failed to fetch Customers: ${error.message}`);
    }
  return data ?? [];
}

export const getCustomersListsFromDB = async (orgId: string ): Promise<CustomerListItem[]> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select(all)
      .eq('org_id', orgId)
      .is('deleted_at', null)

    if (error) {
      throw new AppError(500, `Failed to fetch Customers: ${error.message}`);
    }
  return data as CustomerListItem[];
}

export const getCustomerByIDFromDB = async (id: string, orgId: string ): Promise<CustomerListItem> => {
    const { data, error } = await supabaseAdmin
      .from(tab)
      .select(all)
      .eq('id', id)
      .eq('org_id', orgId)
      .is('deleted_at', null)
      .single()

    if (error) {
      throw new AppError(500, `Failed to fetch Customer: ${error.message}`);
    }
  return data as CustomerListItem;
}

export const addCustomerToDB = async (
  orgId: string,
  userId: string,
  contactId: string
) : Promise<CustomerListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .insert({
        contact_id: contactId,
        status: 'Active',
        org_id: orgId,
        owner_id: userId,
      })
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to add Customer: ${error.message}`);
    }
  return data as CustomerListItem;
}


export const updateCustomerNotesFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  notes: string
) : Promise<CustomerListItem> => {
  const { data, error } = await supabaseAdmin
      .from(tab)
      .update({
        notes: notes,
        updated_by: userId
      })
      .eq('id', id)
      .eq('org_id', orgId)
      .select(all)
      .single()

    if (error) {
      throw new AppError(500, `Failed to update Customer: ${error.message}`);
    }
  return data as CustomerListItem;
}

export const updateCustomerStatusFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  status: CustomerStatus
) : Promise<CustomerListItem> => {
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
      throw new AppError(500, `Failed to update Customer Status: ${error.message}`);
    }
  return data as CustomerListItem;
}



export const deleteCustomerFromDB = async (
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
      throw new AppError(500, `Failed to delete Customer: ${error.message}`);
    }
  return id;
}

export const deleteBulkCustomersFromDB = async (
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
      throw new AppError(500, `Failed to delete Customers: ${error.message}`);
    }
  return ids;
}

export const deleteCustomerByContactIDFromDB = async (
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

export const deleteBulkCustomersByBulkContactIDsFromDB = async (
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