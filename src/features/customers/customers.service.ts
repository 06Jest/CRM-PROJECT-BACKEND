import {
  archiveBulkCustomersFromDB,
  archiveCustomerFromDB,
  deleteBulkCustomersFromDB,
  deleteCustomerFromDB,
  getCustomerByIDFromDB,
  getCustomerListByIDFromDB,
  getCustomersFromDB,
  getCustomersListsFromDB,
  updateCustomerNotesFromDB,
  updateCustomerStatusFromDB,
} from "./customers.repository";
import { addActivityService } from "../activities/activities.service";
import customerEventsPublisher from "./customers-events.publisher";
import { updateContactStatusService } from "../contacts/contacts.service";
import type { CustomerStatus } from "./customers.types";

export const getCustomersService = async (
  orgId: string,
  accessToken: string
) => {
  return getCustomersFromDB(orgId, accessToken);
};

export const getCustomersListsService = async (
  orgId: string,
  accessToken: string
) => {
  return getCustomersListsFromDB(orgId, accessToken);
};

export const getCustomerListByIDService = async (
  id: string,
  orgId: string,
  accessToken: string
) => {
  return getCustomerListByIDFromDB(
    id,
    orgId,
    accessToken
  );
};

export const getCustomerByIDService = async (
  id: string,
  orgId: string,
  accessToken: string
) => {
  return getCustomerByIDFromDB(
    id,
    orgId,
    accessToken
  );
};

export const updateCustomerNotesService = async (
  id: string,
  orgId: string,
  memberId: string,
  notes: string,
  accessToken: string
) => {
  const data = await updateCustomerNotesFromDB(
    id,
    orgId,
    memberId,
    notes,
    accessToken
  );

  await customerEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const updateCustomerStatusService = async (
  id: string,
  orgId: string,
  memberId: string,
  status: CustomerStatus,
  accessToken: string
) => {
  const data = await updateCustomerStatusFromDB(
    id,
    orgId,
    memberId,
    status,
    accessToken
  );

  if (status === "Churned") {
    const customer = await getCustomerByIDFromDB(
      id,
      orgId,
      accessToken
    );

    await updateContactStatusService(
      customer.contact_id,
      orgId,
      memberId,
      "Churned",
      accessToken
    );
  }

  await customerEventsPublisher.statusUpdated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const archiveCustomerService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await archiveCustomerFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await customerEventsPublisher.archived(
    orgId,
    memberId,
    id
  );

  return data;
};

export const deleteCustomerService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const deleted = await getCustomerByIDFromDB(
    id,
    orgId,
    accessToken
  );

  const data = await deleteCustomerFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await addActivityService(
    orgId,
    memberId,
    {
      customer_id: deleted.id,
      type: "customer",
      action: "deleted",
      title: "Removed customer",
      target_name:
        `${deleted.contact?.first_name} ${deleted.contact?.last_name}`,
      description:
        `Removed ${deleted.contact?.first_name} ${deleted.contact?.last_name} as customer`,
    },
    accessToken
  );

  await customerEventsPublisher.deleted(
    orgId,
    memberId,
    id
  );

  return data;
};

export const archiveBulkCustomersService = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await archiveBulkCustomersFromDB(
    ids,
    orgId,
    memberId,
    accessToken
  );

  await customerEventsPublisher.bulkArchived(
    orgId,
    memberId,
    ids
  );

  return data;
};

export const deleteBulkCustomersService = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await deleteBulkCustomersFromDB(
    ids,
    orgId,
    memberId,
    accessToken
  );

  await customerEventsPublisher.bulkDeleted(
    orgId,
    memberId,
    ids
  );

  return data;
};