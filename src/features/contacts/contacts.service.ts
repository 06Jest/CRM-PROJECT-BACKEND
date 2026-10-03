import type {
  AddContact,
  ContactPersonal,
  ContactCareer,
  ContactSocials,
  ContactStatus,
} from './contact.types';

import type { Source, Priority, PreferredTime } from '../../types/global';

import {
  getContactsFromDB,
  getContactsListsFromDB,
  getContactListByIDFromDB,
  getContactByIDFromDB,
  addContactToDB,
  addContactFromLeadsToDB,
  updateContactPersonalFromDB,
  updateContactSocialsFromDB,
  updateContactCareerFromDB,
  updateContactAvatarFromDB,
  updateContactStatusFromDB,
  updateContactSourceFromDB,
  updateContactPriorityFromDB,
  updateContactNotesFromDB,
  updateContactPreferredTmeFromDB,
  archiveContactFromDB,
  archiveBulkContactsFromDB,
  deleteContactFromDB,
  deleteBulkContactsFromDB,
} from './contacts.repository';

import {
  deleteAllDealsByBulkContactsFromDB,
  deleteAllDealsByContactIDFromDB,
} from '../deals/deals.repository';

import {
  deleteBulkCustomersByBulkContactIDsFromDB,
  deleteCustomerByContactIDFromDB,
} from '../../services/customer.service';

import { addActivityToDB } from '../../services/activities.service';
import { ensureResourceLimit } from '../../services/plans.service';
import { deleteImageKitFile } from '../../services/imagekit.service';

import contactEventsPublisher from './contacts-events.publisher';
import { table } from '../../config/tables';

export const getContactsService = async (
  orgId: string,
  accessToken: string
) => {
  return getContactsFromDB(
    orgId,
    accessToken
  );
};

export const getContactsListsService = async (
  orgId: string,
  accessToken: string
) => {
  return getContactsListsFromDB(
    orgId,
    accessToken
  );
};

export const getContactListByIDService = async (
  id: string,
  orgId: string,
  accessToken: string
) => {
  return getContactListByIDFromDB(
    id,
    orgId,
    accessToken
  );
};

export const addContactService = async (
  orgId: string,
  memberId: string,
  contact: AddContact,
  accessToken: string
) => {
  await ensureResourceLimit(
    orgId,
    table.contacts,
    'leads',
    'active_limit',
    accessToken
  );

  const data = await addContactToDB(
    orgId,
    memberId,
    contact,
    accessToken
  );

  const contactName =
    `${data.first_name} ${data.last_name} ${data.suffix ?? ''}`.trim();

  await addActivityToDB(
    orgId,
    memberId,
    {
      contact_id: data.id,
      type: 'contact',
      action: 'created',
      title: 'New contact',
      target_name: contactName,
      description: `Added ${contactName} as contact`,
    },
    accessToken
  );

  await contactEventsPublisher.created(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const addContactFromLeadsService = async (
  orgId: string,
  memberId: string,
  contact: AddContact,
  accessToken: string
) => {
  const data = await addContactFromLeadsToDB(
    orgId,
    memberId,
    contact,
    accessToken
  );

  const contactName =
    `${data.first_name} ${data.last_name} ${data.suffix ?? ''}`.trim();

  await addActivityToDB(
    orgId,
    memberId,
    {
      contact_id: data.id,
      type: 'contact',
      action: 'created',
      title: 'New contact',
      target_name: contactName,
      description: 'Created contact from qualified lead',
    },
    accessToken
  );

  await contactEventsPublisher.created(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const updateContactPersonalService = async (
  id: string,
  orgId: string,
  memberId: string,
  personal: ContactPersonal,
  accessToken: string
) => {
  const data = await updateContactPersonalFromDB(
    id,
    orgId,
    memberId,
    personal,
    accessToken
  );

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateContactSocialsService = async (
  id: string,
  orgId: string,
  memberId: string,
  socials: ContactSocials,
  accessToken: string
) => {
  const data = await updateContactSocialsFromDB(
    id,
    orgId,
    memberId,
    socials,
    accessToken
  );

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateContactCareerService = async (
  id: string,
  orgId: string,
  memberId: string,
  career: ContactCareer,
  accessToken: string
) => {
  const data = await updateContactCareerFromDB(
    id,
    orgId,
    memberId,
    career,
    accessToken
  );

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateContactAvatarService = async (
  id: string,
  orgId: string,
  memberId: string,
  avatarFileId: string | null,
  avatarUrl: string | null,
  accessToken: string
) => {
  const {
    data,
    oldAvatarFileId,
  } = await updateContactAvatarFromDB(
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

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateContactStatusService = async (
  id: string,
  orgId: string,
  memberId: string,
  status: ContactStatus,
  accessToken: string
) => {
  const data = await updateContactStatusFromDB(
    id,
    orgId,
    memberId,
    status,
    accessToken
  );

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateContactSourceService = async (
  id: string,
  orgId: string,
  memberId: string,
  source: Source,
  accessToken: string
) => {
  const data = await updateContactSourceFromDB(
    id,
    orgId,
    memberId,
    source,
    accessToken
  );

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateContactPriorityService = async (
  id: string,
  orgId: string,
  memberId: string,
  priority: Priority,
  accessToken: string
) => {
  const data = await updateContactPriorityFromDB(
    id,
    orgId,
    memberId,
    priority,
    accessToken
  );

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateContactNotesService = async (
  id: string,
  orgId: string,
  memberId: string,
  notes: string,
  accessToken: string
) => {
  const data = await updateContactNotesFromDB(
    id,
    orgId,
    memberId,
    notes,
    accessToken
  );

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateContactPreferredTimeService = async (
  id: string,
  orgId: string,
  memberId: string,
  preferredTime: PreferredTime,
  accessToken: string
) => {
  const data = await updateContactPreferredTmeFromDB(
    id,
    orgId,
    memberId,
    preferredTime,
    accessToken
  );

  await contactEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const archiveContactService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await archiveContactFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await contactEventsPublisher.archived(
    orgId,
    memberId,
    id
  );

  return data;
};

export const archiveBulkContactsService = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await archiveBulkContactsFromDB(
    ids,
    orgId,
    memberId,
    accessToken
  );

  await contactEventsPublisher.bulkArchived(
    orgId,
    memberId,
    ids
  );

  return data;
};

export const deleteContactService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const deleted = await getContactByIDFromDB(
    id,
    orgId,
    accessToken
  );

  const data = await deleteContactFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  const contactName =
    `${deleted.first_name} ${deleted.last_name} ${deleted.suffix ?? ''}`.trim();

  await addActivityToDB(
    orgId,
    memberId,
    {
      contact_id: deleted.id,
      type: 'contact',
      action: 'deleted',
      title: 'Removed contact',
      target_name: contactName,
      description: `Removed ${contactName} as contact`,
    },
    accessToken
  );

  await deleteAllDealsByContactIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await deleteCustomerByContactIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await contactEventsPublisher.deleted(
    orgId,
    memberId,
    id
  );

  return data;
};

export const deleteBulkContactsService = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await deleteBulkContactsFromDB(
    ids,
    orgId,
    memberId,
    accessToken
  );

  await Promise.all([
    deleteAllDealsByBulkContactsFromDB(
      ids,
      orgId,
      memberId,
      accessToken
    ),

    deleteBulkCustomersByBulkContactIDsFromDB(
      ids,
      orgId,
      memberId,
      accessToken
    ),
  ]);

  await addActivityToDB(
    orgId,
    memberId,
    {
      type: 'contact',
      action: 'deleted',
      title: 'Removed contacts',
      target_name: `${ids.length} contacts`,
      description: `Removed ${ids.length} contacts`,
    },
    accessToken
  );

  await contactEventsPublisher.bulkDeleted(
    orgId,
    memberId,
    ids
  );

  return data;
};