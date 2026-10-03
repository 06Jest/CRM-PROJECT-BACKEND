import {
  getLeadsFromDB,
  getLeadsListsFromDB,
  getLeadListByIDFromDB,
  getLeadByIDFromDB,
  addLeadToDB,
  updateLeadPersonalFromDB,
  updateLeadSocialsFromDB,
  updateLeadCareerFromDB,
  updateLeadAvatarFromDB,
  updateLeadStatusFromDB,
  markLeadConvertedFromDB,
  updateLeadSourceFromDB,
  updateLeadPriorityFromDB,
  updateLeadNotesFromDB,
  updateLeadPreferredTimeFromDB,
  archiveLeadFromDB,
  archiveBulkLeadsFromDB,
  deleteBulkLeadsFromDB,
  deleteLeadFromDB,
} from "./leads.repository";

import type {
  AddLead,
  LeadPersonal,
  LeadCareer,
  LeadSocials,
  LeadStatus,
} from "./leads.types";

import type {
  PreferredTime,
  Priority,
  Source,
} from "../../types/global";

import { addContactFromLeadsToDB } from "../contacts/contacts.repository";
import type { AddContact } from "../contacts/contact.types";
import { addActivityToDB } from "../../services/activities.service";
import { ensureResourceLimit } from "../../services/plans.service";
import { deleteImageKitFile } from "../../services/imagekit.service";
import leadEventsPublisher from "./leads-events.publisher";
import { table } from "../../config/tables";

export const getLeads = async (
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  return getLeadsFromDB(
    orgId,
    memberId,
    accessToken
  );
};

export const getLeadsLists = async (
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  return getLeadsListsFromDB(
    orgId,
    memberId,
    accessToken
  );
};

export const getLeadListByID = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  return getLeadListByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );
};

export const addLead = async (
  orgId: string,
  memberId: string,
  lead: AddLead,
  accessToken: string
) => {
  await ensureResourceLimit(
    orgId,
    table.leads,
    "leads",
    "active_limit",
    accessToken
  );

  const data = await addLeadToDB(
    orgId,
    memberId,
    lead,
    accessToken
  );

  await addActivityToDB(
    orgId,
    memberId,
    {
      lead_id: data.id,
      type: "lead",
      action: "created",
      title: "New lead",
      target_name: `${lead.first_name} ${lead.last_name} ${data.suffix ?? ""}`,
      description: `Added ${lead.first_name} ${lead.last_name} ${data.suffix ?? ""} as lead`,
    },
    accessToken
  );

  await leadEventsPublisher.created(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const updateLeadPersonal = async (
  id: string,
  orgId: string,
  memberId: string,
  personal: LeadPersonal,
  accessToken: string
) => {
  const data = await updateLeadPersonalFromDB(
    id,
    orgId,
    memberId,
    personal,
    accessToken
  );

  await leadEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateLeadSocials = async (
  id: string,
  orgId: string,
  memberId: string,
  socials: LeadSocials,
  accessToken: string
) => {
  const data = await updateLeadSocialsFromDB(
    id,
    orgId,
    memberId,
    socials,
    accessToken
  );

  await leadEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateLeadCareer = async (
  id: string,
  orgId: string,
  memberId: string,
  career: LeadCareer,
  accessToken: string
) => {
  const data = await updateLeadCareerFromDB(
    id,
    orgId,
    memberId,
    career,
    accessToken
  );

  await leadEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateLeadSource = async (
  id: string,
  orgId: string,
  memberId: string,
  source: Source,
  accessToken: string
) => {
  const data = await updateLeadSourceFromDB(
    id,
    orgId,
    memberId,
    source,
    accessToken
  );

  await leadEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateLeadPriority = async (
  id: string,
  orgId: string,
  memberId: string,
  priority: Priority,
  accessToken: string
) => {
  const data = await updateLeadPriorityFromDB(
    id,
    orgId,
    memberId,
    priority,
    accessToken
  );

  await leadEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateLeadNotes = async (
  id: string,
  orgId: string,
  memberId: string,
  notes: string,
  accessToken: string
) => {
  const data = await updateLeadNotesFromDB(
    id,
    orgId,
    memberId,
    notes,
    accessToken
  );

  await leadEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateLeadPreferredTime = async (
  id: string,
  orgId: string,
  memberId: string,
  preferredTime: PreferredTime,
  accessToken: string
) => {
  const data = await updateLeadPreferredTimeFromDB(
    id,
    orgId,
    memberId,
    preferredTime,
    accessToken
  );

  await leadEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateLeadAvatar = async (
  id: string,
  orgId: string,
  memberId: string,
  avatarFileId: string | null,
  avatarUrl: string | null,
  accessToken: string
) => {
  const { data, oldAvatarFileId } =
    await updateLeadAvatarFromDB(
      id,
      orgId,
      memberId,
      avatarFileId,
      avatarUrl,
      accessToken
    );

  if (
    oldAvatarFileId &&
    oldAvatarFileId !== avatarFileId
  ) {
    await deleteImageKitFile(oldAvatarFileId);
  }

  await leadEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateLeadStatus = async (
  id: string,
  orgId: string,
  memberId: string,
  status: LeadStatus,
  accessToken: string
) => {
  const leadData = await getLeadByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  const data = await updateLeadStatusFromDB(
    id,
    orgId,
    memberId,
    status,
    accessToken
  );

  if (status === "Qualified") {
    const contact: AddContact = {
      lead_id: leadData.id,
      avatar_file_id: leadData.avatar_file_id,
      avatar_url: leadData.avatar_url,
      first_name: leadData.first_name,
      last_name: leadData.last_name,
      suffix: leadData.suffix,
      birth_date: leadData.birth_date,
      email: leadData.email,
      phone: leadData.phone,
      company_name: leadData.company_name,
      industry: leadData.industry,
      position: leadData.position,
      department: leadData.department,
      website: leadData.website,
      source: leadData.source as Source,
      priority: leadData.priority,
      notes: leadData.notes,
      preferred_contact_time:
        leadData.preferred_contact_time,
      facebook: leadData.facebook,
      x: leadData.x,
      whatsapp: leadData.whatsapp,
      linkedin: leadData.linkedin,
      instagram: leadData.instagram,
      telegram: leadData.telegram,
      tiktok: leadData.tiktok,
      viber: leadData.viber,
    };

    const contactData =
      await addContactFromLeadsToDB(
        orgId,
        memberId,
        contact,
        accessToken
      );

    await markLeadConvertedFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );

    const contactName =
      `${contactData.first_name} ${contactData.last_name} ${contactData.suffix ?? ""}`.trim();

    await addActivityToDB(
      orgId,
      memberId,
      {
        contact_id: contactData.id,
        type: "contact",
        action: "created",
        title: "New contact",
        target_name: contactName,
        description:
          "Created contact from qualified lead",
      },
      accessToken
    );

    await leadEventsPublisher.converted(
      orgId,
      memberId,
      id
    );
  } else {
    await leadEventsPublisher.updated(
      orgId,
      memberId,
      id
    );
  }

  return data;
};

export const archiveLead = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await archiveLeadFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await leadEventsPublisher.archived(
    orgId,
    memberId,
    id
  );

  return data;
};

export const archiveBulkLeads = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await archiveBulkLeadsFromDB(
    ids,
    orgId,
    memberId,
    accessToken
  );

  await leadEventsPublisher.bulkArchived(
    orgId,
    memberId,
    ids
  );

  return data;
};

export const deleteLead = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const deleted = await getLeadByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  const data = await deleteLeadFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await addActivityToDB(
    orgId,
    memberId,
    {
      lead_id: deleted.id,
      type: "lead",
      action: "deleted",
      title: "Removed contact",
      target_name:
        `${deleted.first_name} ${deleted.last_name} ${deleted.suffix ?? ""}`,
      description:
        `Removed ${deleted.first_name} ${deleted.last_name} ${deleted.suffix ?? ""} as contact`,
    },
    accessToken
  );

  await leadEventsPublisher.deleted(
    orgId,
    memberId,
    id
  );

  return data;
};

export const deleteBulkLeads = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await deleteBulkLeadsFromDB(
    ids,
    orgId,
    memberId,
    accessToken
  );

  await addActivityToDB(
    orgId,
    memberId,
    {
      type: "lead",
      action: "deleted",
      title: "Removed leads",
      target_name: `${ids.length} leads`,
      description: `Removed ${ids.length} leads`,
    },
    accessToken
  );

  await leadEventsPublisher.bulkDeleted(
    orgId,
    memberId,
    ids
  );

  return data;
};