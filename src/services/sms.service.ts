import { createSupabaseUserClient } from "../config/supabase";
import { table } from "../config/tables";

import { AppError } from "../middleware/error.middleware";

import type {
  SmsListItem,
  CreateSms,
  SmsStatus,
} from "../types/sms";


const tab = table.sms;


const senderFKey = "sms_sender_id_fkey";
const contactFKey = "sms_contact_id_fkey";
const leadFKey = "sms_lead_id_fkey";


const selectAll = `
  *,
  lead:leads!${leadFKey}(
    id,
    first_name,
    last_name,
    phone
  ),
  contact:contacts!${contactFKey}(
    id,
    first_name,
    last_name,
    phone
  ),
  sender:profiles!${senderFKey}(
    id,
    first_name,
    last_name
  )
`;



export const getSmsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<SmsListItem[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch SMS: ${error.message}`
    );
  }


  return data ?? [];

};



export const getSmsByIDFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<SmsListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAll)
    .eq("id", id)
    .eq("org_id", orgId)
    .single();


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch SMS: ${error.message}`
    );
  }


  return data;

};



export const getLeadSmsFromDB = async (
  orgId: string,
  leadId: string,
  accessToken: string
): Promise<SmsListItem[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .eq("lead_id", leadId)
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Lead SMS: ${error.message}`
    );
  }


  return data ?? [];

};



export const getContactSmsFromDB = async (
  orgId: string,
  contactId: string,
  accessToken: string
): Promise<SmsListItem[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .eq("contact_id", contactId)
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Contact SMS: ${error.message}`
    );
  }


  return data ?? [];

};



export const getSmsByStatusFromDB = async (
  orgId: string,
  status: SmsStatus,
  accessToken: string
): Promise<SmsListItem[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAll)
    .eq("org_id", orgId)
    .eq("status", status)
    .order("created_at", {
      ascending: false,
    });


  if (error) {
    throw new AppError(
      500,
      `Failed to fetch SMS: ${error.message}`
    );
  }


  return data ?? [];

};



export const addSmsToDB = async (
  orgId: string,
  userId: string,
  sms: CreateSms,
  accessToken: string
): Promise<SmsListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert([
      {
        ...sms,
        org_id: orgId,
        sender_id: userId,
        status: "sent",
      },
    ])
    .select(selectAll)
    .single();


  if (error) {
    throw new AppError(
      500,
      `Failed to create SMS: ${error.message}`
    );
  }


  return data;

};



export const updateSmsStatusFromDB = async (
  id: string,
  orgId: string,
  status: SmsStatus,
  accessToken: string
): Promise<SmsListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .select(selectAll)
    .single();


  if (error) {
    throw new AppError(
      500,
      `Failed to update SMS status: ${error.message}`
    );
  }


  return data;

};