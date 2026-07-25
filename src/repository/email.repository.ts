import { supabaseAdmin } from "../config/supabase";
import { table } from "../config/tables";

import { AppError } from "../middleware/error.middleware";

import type {
  EmailListItem,
  ComposeEmail,
  UpdateDraftEmail,
  EmailStatus,
} from "../types/email";

const tab = table.emails;
const senderFKey = "fk_email_sender";
const orgFKey = "fk_email_org";

const selectAllWithSender = `
 *,
  sender:profiles!${senderFKey}(
    id,
    first_name,
    last_name
  ),
  organization:organizations!${orgFKey}(
    id,
    name
  )
`;
const all = selectAllWithSender;


export const getEmails = async (
  orgId: string
): Promise<EmailListItem[]> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch Emails: ${error.message}`);
  }

  return data ?? [];
};

export const getEmailById = async (
  id: string,
  orgId: string
): Promise<EmailListItem> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .single();

  if (error) {
    throw new AppError(500, `Failed to fetch Email: ${error.message}`);
  }

  return data;
};

export const createDraft = async (
  orgId: string,
  senderId: string,
  email: ComposeEmail
): Promise<EmailListItem> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .insert([
      {
        ...email,

        org_id: orgId,

        sender_id: senderId,

        status: "draft",
      },
    ])
    .select()
    .single();

  if (error) {
    throw new AppError(500, `Failed to create draft: ${error.message}`);
  }

  return data;
};

export const updateDraft = async (
  id: string,
  orgId: string,
  email: UpdateDraftEmail
): Promise<EmailListItem> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .update(email)
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("status", "draft")
    .is("deleted_at", null)
    .select()
    .single();

  if (error) {
    throw new AppError(500, `Failed to update draft: ${error.message}`);
  }

  return data;
};


export const markQueued = async (
  id: string,
  orgId: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(tab)
    .update({
      status: "queued",
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(500, `Failed to queue Email: ${error.message}`);
  }
};

export const markSent = async (
  id: string,
  orgId: string,
  providerMessageId: string
): Promise<void> => {
  const { error } = await supabaseAdmin
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
    throw new AppError(500, `Failed to mark Email as sent: ${error.message}`);
  }
};

export const markFailed = async (
  id: string,
  orgId: string,
  errorMessage: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(tab)
    .update({
      status: "failed",

      error_message: errorMessage,
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(500, `Failed to mark Email as failed: ${error.message}`);
  }
};

export const deleteEmail = async (
  id: string,
  orgId: string
): Promise<string> => {
  const { error } = await supabaseAdmin
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(500, `Failed to delete Email: ${error.message}`);
  }

  return id;
};

export const getEmailsByLead = async (
  orgId: string,
  leadId: string
): Promise<EmailListItem[]> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
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

export const getEmailsByContact = async (
  orgId: string,
  contactId: string
): Promise<EmailListItem[]> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
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

export const getEmailsByCustomer = async (
  orgId: string,
  customerId: string
): Promise<EmailListItem[]> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
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

export const resetEmailToDraft = async (
  id: string,
  orgId: string
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from(tab)
    .update({
      status: "draft",
      error_message: null,
      provider_message_id: null,
      sent_at: null,
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to reset Email: ${error.message}`
    );
  }
};

export const updateEmailStatus = async (
  id: string,
  orgId: string,
  status: EmailStatus
): Promise<void> => {

  const { error } = await supabaseAdmin
    .from(tab)
    .update({
      status,
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if(error){
    throw new AppError(
      500,
      `Failed to update Email status: ${error.message}`
    );
  }
};

