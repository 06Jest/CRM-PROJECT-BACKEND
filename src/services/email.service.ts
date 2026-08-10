
import { createSupabaseUserClient } from "../config/supabase";
import { table } from "../config/tables";

import { AppError } from "../middleware/error.middleware";

import type {
  EmailListItem,
  ComposeEmail,
  UpdateDraftEmail,
} from "../types/email";
import { ensureResourceLimit } from "./plans.service";
import { sendEmailWithResend } from "./resend.service";

const tab = table.emails;
const devEmail = "onboarding@resend.dev";
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


const all = selectAllWithSender;

export const getEmailsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if(error){
    throw new AppError(
      500,
      `Failed to fetch Emails: ${error.message}`
    );
  }

  return data ?? [];
};

export const sendEmailDraft = async (
  id:string,
  orgId:string,
  accessToken:string
):Promise<EmailListItem> => {
  const email = await getEmailByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if(email.status !== "draft"){
    throw new AppError(
      400,
      "Only drafts can be sent"
    );
  }

  if(!email.recipient_email){
    throw new AppError(
      400,
      "Recipient email is required"
    );
  }

  if(!email.subject){
    throw new AppError(
      400,
      "Subject is required"
    );
  }

  if(!email.body_html){
    throw new AppError(
      400,
      "Email body is required"
    );
  }

  await ensureResourceLimit(
    orgId,
    table.emails,
    "emails",
    "active_limit",
    accessToken
  );

  await markEmailQueuedFromDB(
    id,
    orgId,
    accessToken
  );


  try {
    const result = await sendEmailWithResend({
      from:
        `${email.organization.name} <${devEmail}>`,
      to:
        email.recipient_email,
      subject:
        email.subject,
      html:
        email.body_html,
    });
    

    await markEmailSentFromDB(
      id,
      orgId,
      result!.id,
      accessToken
    );

    return await getEmailByIDFromDB(
      id,
      orgId,
      accessToken
    );

  } catch(error:any) {
    await markEmailFailedFromDB(
      id,
      orgId,
      error.message,
      accessToken
    );

    throw error;
  }
};

export const updateDraftEmail = async (
  id:string,
  orgId:string,
  email:UpdateDraftEmail,
  accessToken:string
)=>{
  const existing =
    await getEmailByIDFromDB(
      id,
      orgId,
      accessToken
    );

  if(existing.status !== "draft"){
    throw new AppError(
      400,
      "Only draft emails can be edited"
    );
  }

  return await updateEmailDraftFromDB(
    id,
    orgId,
    email,
    accessToken
  );
};

export const getEmailByIDFromDB = async (
  id:string,
  orgId:string,
  accessToken:string
):Promise<EmailListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data,error } = await db
    .from(tab)
    .select(all)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .single();

  if(error){
    throw new AppError(
      500,
      `Failed to fetch Email: ${error.message}`
    );
  }

  return data;
};

export const createEmailDraftToDB = async (
  orgId:string,
  senderId:string,
  email:ComposeEmail,
  accessToken:string
):Promise<EmailListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data,error } = await db
    .from(tab)
    .insert({
      ...email,
      org_id:orgId,
      sender_id:senderId,
      status:"draft",
    })
    .select(all)
    .single();

  if(error){
    throw new AppError(
      500,
      `Failed to create draft: ${error.message}`
    );
  }
  return data;
};

export const updateEmailDraftFromDB = async (
  id:string,
  orgId:string,
  email:UpdateDraftEmail,
  accessToken:string
):Promise<EmailListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data,error } = await db
    .from(tab)
    .update(email)
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("status","draft")
    .is("deleted_at", null)
    .select(all)
    .single();


  if(error){
    throw new AppError(
      500,
      `Failed to update draft: ${error.message}`
    );
  }


  return data;
};
export const markEmailQueuedFromDB = async (
  id:string,
  orgId:string,
  accessToken:string
):Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const {error} = await db
    .from(tab)
    .update({
      status:"queued"
    })
    .eq("id",id)
    .eq("org_id",orgId);

  if(error){
    throw new AppError(
      500,
      `Failed to queue Email: ${error.message}`
    );
  }
};

export const markEmailSentFromDB = async (
  id:string,
  orgId:string,
  providerMessageId:string,
  accessToken:string
):Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const {error} = await db
    .from(tab)
    .update({
      status:"sent",
      provider_message_id:providerMessageId,
      sent_at:new Date().toISOString(),
      error_message:null,
    })
    .eq("id",id)
    .eq("org_id",orgId);

  if(error){
    throw new AppError(
      500,
      `Failed to mark Email as sent: ${error.message}`
    );
  }
};

export const markEmailFailedFromDB = async (
  id:string,
  orgId:string,
  errorMessage:string,
  accessToken:string
):Promise<void> => {
  const db = createSupabaseUserClient(accessToken);

  const {error} = await db
    .from(tab)
    .update({
      status:"failed",
      error_message:errorMessage,
    })
    .eq("id",id)
    .eq("org_id",orgId);

  if(error){
    throw new AppError(
      500,
      `Failed to mark Email as failed: ${error.message}`
    );
  }
};

export const deleteEmailFromDB = async (
  id:string,
  orgId:string,
  accessToken:string
):Promise<string> => {
  const db = createSupabaseUserClient(accessToken);

  const {error} = await db
    .from(tab)
    .update({
      deleted_at:new Date().toISOString()
    })
    .eq("id",id)
    .eq("org_id",orgId);

  if(error){
    throw new AppError(
      500,
      `Failed to delete Email: ${error.message}`
    );
  }
  return id;
};

export const getLeadEmailsFromDB = async (
  orgId:string,
  leadId:string,
  accessToken:string
):Promise<EmailListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const {data,error} = await db
    .from(tab)
    .select(all)
    .eq("org_id",orgId)
    .eq("lead_id",leadId)
    .is("deleted_at",null)
    .order("created_at",{ascending:false});

  if(error){
    throw new AppError(
      500,
      `Failed to fetch Lead Emails: ${error.message}`
    );
  }

  return data ?? [];
};

export const getContactEmailsFromDB = async (
  orgId:string,
  contactId:string,
  accessToken:string
):Promise<EmailListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const {data,error} = await db
    .from(tab)
    .select(all)
    .eq("org_id",orgId)
    .eq("contact_id",contactId)
    .is("deleted_at",null)
    .order("created_at",{ascending:false});

  if(error){
    throw new AppError(
      500,
      `Failed to fetch Contact Emails: ${error.message}`
    );
  }

  return data ?? [];
};

export const getCustomerEmailsFromDB = async (
  orgId:string,
  customerId:string,
  accessToken:string
):Promise<EmailListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const {data,error} = await db
    .from(tab)
    .select(all)
    .eq("org_id",orgId)
    .eq("customer_id",customerId)
    .is("deleted_at",null)
    .order("created_at",{ascending:false});

  if(error){
    throw new AppError(
      500,
      `Failed to fetch Customer Emails: ${error.message}`
    );
  }

  return data ?? [];
};