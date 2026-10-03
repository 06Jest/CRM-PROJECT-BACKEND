import {
  addDealToDB,
  archiveDealFromDB,
  deleteDealFromDB,
  getDealListByIDFromDB,
  getDealsByIDFromDB,
  getDealsFromDB,
  getDealsListsByContactIDFromDB,
  getDealsListsFromDB,
  getOpenDealsByContactIDFromDB,
  updateDealFromDB,
  updateDealStageFromDB,
} from "./deals.repository";

import {
  getContactByIDFromDB,
  updateContactStatusFromDB,
} from "../contacts/contacts.repository";

import { addCustomerToDB } from "../../services/customer.service";
import { addActivityToDB } from "../../services/activities.service";
import { ensureResourceLimit } from "../../services/plans.service";
import { table } from "../../config/tables";
import dealEventsPublisher from "./deals-events.publisher";

import type {
  AddDeal,
  DealListItem,
  DealStage,
  UpdateDeal,
} from "./deals.types";

export const getDealsService = async (
  orgId: string,
  accessToken: string
) => {
  return getDealsFromDB(orgId, accessToken);
};

export const getDealsListsService = async (
  orgId: string,
  accessToken: string
) => {
  return getDealsListsFromDB(orgId, accessToken);
};

export const getDealsListsByContactIDService = async (
  contactId: string,
  orgId: string,
  accessToken: string
) => {
  return getDealsListsByContactIDFromDB(
    contactId,
    orgId,
    accessToken
  );
};

export const getDealListByIDService = async (
  id: string,
  orgId: string,
  accessToken: string
) => {
  return getDealListByIDFromDB(id, orgId, accessToken);
};

export const addDealService = async (
  orgId: string,
  memberId: string,
  deal: AddDeal,
  accessToken: string
) => {
  await ensureResourceLimit(
    orgId,
    table.deals,
    "leads",
    "active_limit",
    accessToken
  );

  const contact = await getContactByIDFromDB(
    deal.contact_id,
    orgId,
    accessToken
  );

  if (contact.status === "Contacted") {
    await updateContactStatusFromDB(
      contact.id,
      orgId,
      memberId,
      "Opportunity",
      accessToken
    );
  }

  const data = await addDealToDB(
    orgId,
    memberId,
    deal,
    accessToken
  );

  await addActivityToDB(
    orgId,
    memberId,
    {
      contact_id: data.contact_id,
      type: "deal",
      action: "created",
      title: "New deal",
      target_name: data.title,
      description: `Created deal ${data.title}`,
    },
    accessToken
  );

  await dealEventsPublisher.created(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const updateDealService = async (
  id: string,
  memberId: string,
  deal: UpdateDeal,
  orgId: string,
  accessToken: string
) => {
  const data = await updateDealFromDB(
    id,
    memberId,
    deal,
    orgId,
    accessToken
  );

  await dealEventsPublisher.updated(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const updateDealStageService = async (
  id: string,
  memberId: string,
  stage: DealStage,
  orgId: string,
  accessToken: string
) => {
  const deal = await getDealsByIDFromDB(
    id,
    orgId,
    accessToken
  );

  const contact = await getContactByIDFromDB(
    deal.contact_id,
    orgId,
    accessToken
  );

  let data: DealListItem;

  if (stage === "Closed Won") {
    if (contact.status !== "Customer") {
      await ensureResourceLimit(
        orgId,
        table.customers,
        "customers",
        "active_limit",
        accessToken
      );

      await addCustomerToDB(
        orgId,
        memberId,
        contact.assigned_to ?? null,
        contact.id,
        accessToken
      );

      await updateContactStatusFromDB(
        contact.id,
        orgId,
        memberId,
        "Customer",
        accessToken
      );

      await addActivityToDB(
        orgId,
        memberId,
        {
          contact_id: contact.id,
          type: "customer",
          action: "created",
          title: "New customer",
          target_name:
            `${contact.first_name} ${contact.last_name}`,
          description:
            "Converted contact into customer",
        },
        accessToken
      );
    }

    await addActivityToDB(
      orgId,
      memberId,
      {
        contact_id: contact.id,
        type: "deal",
        action: "completed",
        title: "Deal won",
        target_name: deal.title,
        description: `Won deal ${deal.title}`,
      },
      accessToken
    );

    data = await updateDealStageFromDB(
      id,
      orgId,
      memberId,
      stage,
      accessToken
    );
  } else if (stage === "Closed Lost") {
    await addActivityToDB(
      orgId,
      memberId,
      {
        contact_id: contact.id,
        type: "deal",
        action: "cancelled",
        title: "Deal lost",
        target_name: deal.title,
        description: `Lost deal ${deal.title}`,
      },
      accessToken
    );

    data = await updateDealStageFromDB(
      id,
      orgId,
      memberId,
      stage,
      accessToken
    );

    const openDeals = await getOpenDealsByContactIDFromDB(
      contact.id,
      orgId,
      accessToken
    );

    if (
      openDeals.length === 0 &&
      contact.status === "Opportunity"
    ) {
      await updateContactStatusFromDB(
        contact.id,
        orgId,
        memberId,
        "Contacted",
        accessToken
      );

      await addActivityToDB(
        orgId,
        memberId,
        {
          contact_id: contact.id,
          type: "contact",
          action: "updated",
          title: "Contact status updated",
          target_name:
            `${contact.first_name} ${contact.last_name}`,
          description:
            "Contact moved back to Contacted because there are no open deals",
        },
        accessToken
      );
    }
  } else {
    data = await updateDealStageFromDB(
      id,
      orgId,
      memberId,
      stage,
      accessToken
    );
  }

  if (stage === "Closed Won" || stage === "Closed Lost") {
    await dealEventsPublisher.closed(
      orgId,
      memberId,
      data.id
    );
  } else {
    await dealEventsPublisher.stageUpdated(
      orgId,
      memberId,
      data.id
    );
  }

  return data;
};

export const archiveDealService = async (
  id: string,
  memberId: string,
  orgId: string,
  accessToken: string
) => {
  const data = await archiveDealFromDB(
    id,
    memberId,
    orgId,
    accessToken
  );

  await dealEventsPublisher.archived(
    orgId,
    memberId,
    data
  );

  return data;
};

export const deleteDealService = async (
  id: string,
  memberId: string,
  orgId: string,
  accessToken: string
) => {
  const deleted = await getDealsByIDFromDB(
    id,
    orgId,
    accessToken
  );

  const data = await deleteDealFromDB(
    id,
    memberId,
    orgId,
    accessToken
  );

  await addActivityToDB(
    orgId,
    memberId,
    {
      contact_id: deleted.contact_id,
      type: "deal",
      action: "deleted",
      title: "Removed deal",
      target_name: deleted.title,
      description: `Removed deal ${deleted.title}`,
    },
    accessToken
  );

  await dealEventsPublisher.deleted(
    orgId,
    memberId,
    data
  );

  return data;
};