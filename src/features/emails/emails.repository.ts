import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";
import { AppError } from "../../middleware/error.middleware";

import type {
  EmailListItem,
  ComposeEmail,
  UpdateDraftEmail,
} from "./emails.types";

const tab = table.emails;

const senderFKey = "emails_sender_id_fkey";
const orgFKey = "fk_email_org";
const contactFKey = "fk_email_contact";
const leadFKey = "fk_email_lead";

const selectAllWithSender = `
  *,
  sender:organization_members!${senderFKey}(
    id,
    profile:profiles(
      first_name,
      last_name,
      avatar_url
    )
  ),
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
  organization:organizations!${orgFKey}(
    id,
    name
  )
`;

export const getEmailsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAllWithSender)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Emails: ${error.message}`
    );
  }

  return data ?? [];
};

export const getEmailByIDFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<EmailListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAllWithSender)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Email: ${error.message}`
    );
  }

  return data;
};

export const createEmailDraftToDB = async (
  orgId: string,
  senderId: string,
  email: ComposeEmail,
  accessToken: string,
  senderName: string,
  senderEmail: string
): Promise<EmailListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert({
      ...email,
      org_id: orgId,
      sender_id: senderId,
      sender_name: senderName,
      sender_email: senderEmail,
      status: "draft",
    })
    .select(selectAllWithSender)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to create draft: ${error.message}`
    );
  }

  return data;
};

export const updateEmailDraftFromDB = async (
  id: string,
  orgId: string,
  email: UpdateDraftEmail,
  accessToken: string
): Promise<EmailListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update(email)
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("status", "draft")
    .is("deleted_at", null)
    .select(selectAllWithSender)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update draft: ${error.message}`
    );
  }

  return data;
};

export const markEmailQueuedFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      status: "queued",
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to queue Email: ${error.message}`
    );
  }
};

export const markEmailSentFromDB = async (
  id: string,
  orgId: string,
  providerMessageId: string,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      status: "sent",
      provider_message_id: providerMessageId,
      sent_at: new Date().toISOString(),
      error_message: null,
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to mark Email as sent: ${error.message}`
    );
  }
};

export const markEmailFailedFromDB = async (
  id: string,
  orgId: string,
  errorMessage: string,
  accessToken: string
): Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      status: "failed",
      error_message: errorMessage,
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to mark Email as failed: ${error.message}`
    );
  }
};

export const deleteEmailFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<string> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete Email: ${error.message}`
    );
  }

  return id;
};

export const getLeadEmailsFromDB = async (
  orgId: string,
  leadId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAllWithSender)
    .eq("org_id", orgId)
    .eq("lead_id", leadId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Lead Emails: ${error.message}`
    );
  }

  return data ?? [];
};

export const getContactEmailsFromDB = async (
  orgId: string,
  contactId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAllWithSender)
    .eq("org_id", orgId)
    .eq("contact_id", contactId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Contact Emails: ${error.message}`
    );
  }

  return data ?? [];
};

export const getCustomerEmailsFromDB = async (
  orgId: string,
  customerId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(selectAllWithSender)
    .eq("org_id", orgId)
    .eq("customer_id", customerId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Customer Emails: ${error.message}`
    );
  }

  return data ?? [];
};