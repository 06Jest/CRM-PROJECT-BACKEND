import { createSupabaseUserClient } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';
import type {
  Customer,
  CustomerListItem,
  CustomerStatus
} from '../types/customer';

const tab = table.customers;

const fkey = 'customers_owner_id_fkey';
const contactfkey = 'fk_customer_contact';

const selectAllWithOwner = `
  *,
  owner:organization_members!${fkey}(
    id,
    profile:profiles(
      first_name,
      last_name,
      avatar_url
    )
  ),
  contact:contacts!${contactfkey}(
    id,
    first_name,
    last_name,
    email,
    phone
  )
`;

const all = selectAllWithOwner;

export const getCustomersFromDB = async (
  orgId: string,
  accessToken: string
): Promise<Customer[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('*')
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .order('first_name', {
      ascending: true
    });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch customers: ${error.message}`
    );
  }

  return data ?? [];
};


export const getCustomersListsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<CustomerListItem[]> => {
  const db = createSupabaseUserClient(accessToken);
  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq('org_id', orgId)
    .is('deleted_at', null);

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch customers: ${error.message}`
    );
  }
  return data as CustomerListItem[];
};


export const getCustomerListByIDFromDB = async (
  customerId: string,
  orgId: string,
  accessToken: string
): Promise<CustomerListItem> => {
  const db = createSupabaseUserClient(accessToken);
  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq('org_id', orgId)
    .eq('id', customerId)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch customers: ${error.message}`
    );
  }
  return data as CustomerListItem;
};


export const getCustomerByIDFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<CustomerListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq('id', id)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch customer: ${error.message}`
    );
  }

  return data as CustomerListItem;
};


export const addCustomerToDB = async (
  orgId: string,
  memberId: string,
  contactId: string,
  accessToken: string
): Promise<CustomerListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert({
      contact_id: contactId,
      status: 'Active',
      org_id: orgId,
      owner_id: memberId
    })
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to add customer: ${error.message}`
    );
  }

  return data as CustomerListItem;
};


export const updateCustomerNotesFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  notes: string,
  accessToken: string
): Promise<CustomerListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      notes,
      updated_by: memberId
    })
    .eq('id', id)
    .eq('org_id', orgId)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update customer: ${error.message}`
    );
  }

  return data as CustomerListItem;
};


export const updateCustomerStatusFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  status: CustomerStatus,
  accessToken: string
): Promise<CustomerListItem> => {
  const db = createSupabaseUserClient(accessToken);
  const { data, error } = await db
    .from(tab)
    .update({
      status,
      updated_by: memberId
    })
    .eq('id', id)
    .eq('org_id', orgId)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update customer status: ${error.message}`
    );
  }
  return data as CustomerListItem;
};


export const deleteCustomerFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: memberId
    })
    .eq('id', id)
    .eq('org_id', orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete customer: ${error.message}`
    );
  }

  return id;
};


export const deleteBulkCustomersFromDB = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: memberId
    })
    .in('id', ids)
    .eq('org_id', orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete customers: ${error.message}`
    );
  }

  return ids;
};


export const deleteCustomerByContactIDFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: memberId
    })
    .eq('contact_id', id)
    .eq('org_id', orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete customer: ${error.message}`
    );
  }

  return id;
};


export const deleteBulkCustomersByBulkContactIDsFromDB = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: memberId
    })
    .in('contact_id', ids)
    .eq('org_id', orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete customers: ${error.message}`
    );
  }

  return ids;
};