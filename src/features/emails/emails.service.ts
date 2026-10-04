import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";
import { getWorkspaceName } from "../../services/organization.service";
import { ensureResourceLimit } from "../../services/plans.service";
import { sendEmailWithResend } from "./resend.service";
import { addActivityService } from "../activities/activities.service";

import type {
  EmailListItem,
  ComposeEmail,
  UpdateDraftEmail,
} from "./emails.types";

import {
  getEmailsFromDB,
  getEmailByIDFromDB,
  createEmailDraftToDB,
  updateEmailDraftFromDB,
  markEmailQueuedFromDB,
  markEmailSentFromDB,
  markEmailFailedFromDB,
  deleteEmailFromDB,
  getLeadEmailsFromDB,
  getContactEmailsFromDB,
  getCustomerEmailsFromDB,
} from "./emails.repository";

const devEmail = "noreply@unithreadcrm.com";

export const getEmailsService = async (
  orgId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  return getEmailsFromDB(orgId, accessToken);
};

export const getEmailByIDService = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<EmailListItem> => {
  return getEmailByIDFromDB(id, orgId, accessToken);
};

export const createEmailDraftService = async (
  orgId: string,
  senderId: string,
  email: ComposeEmail,
  accessToken: string
): Promise<EmailListItem> => {
  const senderName = await getWorkspaceName(
    orgId,
    accessToken
  );

  return createEmailDraftToDB(
    orgId,
    senderId,
    email,
    accessToken,
    senderName,
    devEmail
  );
};

export const sendEmailService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<EmailListItem> => {
  const email = await getEmailByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (email.status !== "draft") {
    throw new AppError(
      400,
      "Only drafts can be sent"
    );
  }

  if (!email.recipient_email) {
    throw new AppError(
      400,
      "Recipient email is required"
    );
  }

  if (!email.subject) {
    throw new AppError(
      400,
      "Subject is required"
    );
  }

  if (!email.body_html) {
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
      from: `${email.organization.name} <${devEmail}>`,
      to: email.recipient_email,
      subject: email.subject,
      html: email.body_html,
    });

    await markEmailSentFromDB(
      id,
      orgId,
      result!.id,
      accessToken
    );

    const targetName = email.lead
      ? `${email.lead.first_name} ${email.lead.last_name}`
      : email.contact
        ? `${email.contact.first_name} ${email.contact.last_name}`
        : "Unknown";

    await addActivityService(
      orgId,
      memberId,
      {
        lead_id: email.lead_id,
        contact_id: email.contact_id,
        type: "email",
        action: "sent",
        title: "Email sent",
        target_name: targetName,
        description: `Sent Email to ${targetName}`,
      },
      accessToken
    );

    return await getEmailByIDFromDB(
      id,
      orgId,
      accessToken
    );
  } catch (error: any) {
    await markEmailFailedFromDB(
      id,
      orgId,
      error.message,
      accessToken
    );

    throw error;
  }
};

export const updateEmailDraftService = async (
  id: string,
  orgId: string,
  email: UpdateDraftEmail,
  accessToken: string
): Promise<EmailListItem> => {
  const existing = await getEmailByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (existing.status !== "draft") {
    throw new AppError(
      400,
      "Only draft emails can be edited"
    );
  }

  return updateEmailDraftFromDB(
    id,
    orgId,
    email,
    accessToken
  );
};

export const getLeadEmailHistoryService = async (
  orgId: string,
  leadId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  return getLeadEmailsFromDB(
    orgId,
    leadId,
    accessToken
  );
};

export const getContactEmailHistoryService = async (
  orgId: string,
  contactId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  return getContactEmailsFromDB(
    orgId,
    contactId,
    accessToken
  );
};

export const getCustomerEmailHistoryService = async (
  orgId: string,
  customerId: string,
  accessToken: string
): Promise<EmailListItem[]> => {
  return getCustomerEmailsFromDB(
    orgId,
    customerId,
    accessToken
  );
};

export const deleteEmailService = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<string> => {
  return deleteEmailFromDB(
    id,
    orgId,
    accessToken
  );
};