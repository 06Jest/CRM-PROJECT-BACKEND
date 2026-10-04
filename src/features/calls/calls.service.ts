import { AppError } from "../../middleware/error.middleware";
import { table } from "../../config/tables";

import { addActivityService } from "../activities/activities.service";
import { ensureResourceLimitService } from "../subscriptions/subscriptions-limits.service";

import callEventsPublisher from "./calls-events.publisher";

import type {
  CallListItem,
  CreateCall,
  UpdateCall,
  EndCall,
} from "./calls.types";

import {
  getCallsFromDB,
  getCallByIDFromDB,
  getLeadCallsFromDB,
  getContactCallsFromDB,
  addCallToDB,
  updateCallFromDB,
  startCallFromDB,
  endCallFromDB,
  cancelCallFromDB,
  archiveCallFromDB,
  deleteCallFromDB,
} from "./calls.repository";

export const getCallsService = async (
  orgId: string,
  accessToken: string
): Promise<CallListItem[]> => {
  return getCallsFromDB(
    orgId,
    accessToken
  );
};

export const getCallByIDService = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<CallListItem> => {
  return getCallByIDFromDB(
    id,
    orgId,
    accessToken
  );
};

export const getLeadCallsService = async (
  orgId: string,
  leadId: string,
  accessToken: string
): Promise<CallListItem[]> => {
  return getLeadCallsFromDB(
    orgId,
    leadId,
    accessToken
  );
};

export const getContactCallsService = async (
  orgId: string,
  contactId: string,
  accessToken: string
): Promise<CallListItem[]> => {
  return getContactCallsFromDB(
    orgId,
    contactId,
    accessToken
  );
};

export const addCallService = async (
  orgId: string,
  memberId: string,
  call: CreateCall,
  accessToken: string
): Promise<CallListItem> => {
  await ensureResourceLimitService(
    orgId,
    table.calls,
    "calls",
    "active_limit",
    accessToken
  );

  const data = await addCallToDB(
    orgId,
    memberId,
    call,
    accessToken
  );

  await callEventsPublisher.created(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const updateCallService = async (
  id: string,
  orgId: string,
  memberId: string,
  call: UpdateCall,
  accessToken: string
): Promise<CallListItem> => {
  const existing = await getCallByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (existing.status === "completed") {
    throw new AppError(
      400,
      "Completed calls cannot be updated"
    );
  }

  if (existing.status === "cancelled") {
    throw new AppError(
      400,
      "Cancelled calls cannot be updated"
    );
  }

  const data = await updateCallFromDB(
    id,
    orgId,
    call,
    accessToken
  );

  await callEventsPublisher.updated(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const startCallService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<CallListItem> => {
  const existing = await getCallByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (existing.status === "active") {
    throw new AppError(
      400,
      "Call is already active"
    );
  }

  if (existing.status === "completed") {
    throw new AppError(
      400,
      "Completed calls cannot be started"
    );
  }

  if (existing.status === "cancelled") {
    throw new AppError(
      400,
      "Cancelled calls cannot be started"
    );
  }

  const data = await startCallFromDB(
    id,
    orgId,
    accessToken
  );

  await callEventsPublisher.started(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const endCallService = async (
  id: string,
  orgId: string,
  memberId: string,
  call: EndCall,
  accessToken: string
): Promise<CallListItem> => {
  const existing = await getCallByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (existing.status !== "active") {
    throw new AppError(
      400,
      "Only active calls can be completed"
    );
  }

  if (!existing.started_at) {
    throw new AppError(
      400,
      "Call has not been started."
    );
  }

  const endedAt = new Date().toISOString();

  const durationSeconds = Math.floor(
    (
      new Date(endedAt).getTime() -
      new Date(existing.started_at).getTime()
    ) / 1000
  );

  const data = await endCallFromDB(
    id,
    orgId,
    call,
    endedAt,
    durationSeconds,
    accessToken
  );

  const targetName = existing.lead
    ? `${existing.lead.first_name} ${existing.lead.last_name}`
    : existing.contact
      ? `${existing.contact.first_name} ${existing.contact.last_name}`
      : "Unknown";

  await addActivityService(
    orgId,
    memberId,
    {
      lead_id: existing.lead_id,
      contact_id: existing.contact_id,
      type: "call",
      action: "completed",
      title: "Call completed",
      target_name: targetName,
      description: `Completed call: ${existing.subject}`,
    },
    accessToken
  );

  await callEventsPublisher.completed(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const cancelCallService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<CallListItem> => {
  const existing = await getCallByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (existing.status === "completed") {
    throw new AppError(
      400,
      "Completed calls cannot be cancelled"
    );
  }

  if (existing.status === "cancelled") {
    throw new AppError(
      400,
      "Call is already cancelled"
    );
  }

  const data = await cancelCallFromDB(
    id,
    orgId,
    accessToken
  );

  await callEventsPublisher.cancelled(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const archiveCallService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string> => {
  const data = await archiveCallFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await callEventsPublisher.archived(
    orgId,
    memberId,
    id
  );

  return data;
};

export const deleteCallService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string> => {
  const data = await deleteCallFromDB(
    id,
    orgId,
    accessToken
  );

  await callEventsPublisher.deleted(
    orgId,
    memberId,
    id
  );

  return data;
};