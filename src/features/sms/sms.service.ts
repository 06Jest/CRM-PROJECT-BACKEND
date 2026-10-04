import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import { addActivityService } from "../activities/activities.service";
import { ensureResourceLimitService } from "../subscriptions/subscriptions-limits.service";

import type {
  SmsListItem,
  CreateSms,
  SmsStatus,
} from "./sms.types";

import {
  getSmsFromDB,
  getSmsByIDFromDB,
  getLeadSmsFromDB,
  getContactSmsFromDB,
  getSmsByStatusFromDB,
  addSmsToDB,
  updateSmsStatusFromDB,
  archiveSmsFromDB,
} from "./sms.repository";

export const getSmsService = async (
  orgId: string,
  accessToken: string
): Promise<SmsListItem[]> => {
  return getSmsFromDB(
    orgId,
    accessToken
  );
};

export const getSmsByIDService = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<SmsListItem> => {
  return getSmsByIDFromDB(
    id,
    orgId,
    accessToken
  );
};

export const getLeadSmsService = async (
  orgId: string,
  leadId: string,
  accessToken: string
): Promise<SmsListItem[]> => {
  return getLeadSmsFromDB(
    orgId,
    leadId,
    accessToken
  );
};

export const getContactSmsService = async (
  orgId: string,
  contactId: string,
  accessToken: string
): Promise<SmsListItem[]> => {
  return getContactSmsFromDB(
    orgId,
    contactId,
    accessToken
  );
};

export const getSmsByStatusService = async (
  orgId: string,
  status: SmsStatus,
  accessToken: string
): Promise<SmsListItem[]> => {
  return getSmsByStatusFromDB(
    orgId,
    status,
    accessToken
  );
};

export const addSmsService = async (
  orgId: string,
  memberId: string,
  sms: CreateSms,
  accessToken: string
): Promise<SmsListItem> => {
  if (sms.lead_id && sms.contact_id) {
    throw new AppError(
      400,
      "SMS can only belong to either lead or contact"
    );
  }

  if (!sms.lead_id && !sms.contact_id) {
    throw new AppError(
      400,
      "SMS requires a lead or contact"
    );
  }

  await ensureResourceLimitService(
    orgId,
    table.sms,
    "sms",
    "active_limit",
    accessToken
  );

  const data = await addSmsToDB(
    orgId,
    memberId,
    sms,
    accessToken
  );

  const targetName = data.lead
    ? `${data.lead.first_name} ${data.lead.last_name}`
    : data.contact
      ? `${data.contact.first_name} ${data.contact.last_name}`
      : "Unknown";

  await addActivityService(
    orgId,
    memberId,
    {
      lead_id: data.lead_id,
      contact_id: data.contact_id,
      type: "sms",
      action: "sent",
      title: "SMS sent",
      target_name: targetName,
      description: `Sent SMS to ${targetName}`,
    },
    accessToken
  );

  return data;
};

export const updateSmsStatusService = async (
  id: string,
  orgId: string,
  status: SmsStatus,
  accessToken: string
): Promise<SmsListItem> => {
  const existing = await getSmsByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (existing.status === "delivered") {
    throw new AppError(
      400,
      "Delivered SMS cannot be updated"
    );
  }

  if (existing.status === "failed") {
    throw new AppError(
      400,
      "Failed SMS cannot be updated"
    );
  }

  const timestamp = new Date().toISOString();

  const lifecycleUpdate = {
    status,
    ...(status === "delivered" && {
      delivered_at: timestamp,
    }),
    ...(status === "failed" && {
      failed_at: timestamp,
    }),
  };

  return updateSmsStatusFromDB(
    id,
    orgId,
    status,
    lifecycleUpdate,
    accessToken
  );
};

export const archiveSmsService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string> => {
  return archiveSmsFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );
};