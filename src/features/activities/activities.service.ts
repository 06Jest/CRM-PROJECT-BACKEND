import {
  getActivitiesFromDB,
  getActivityByIDFromDB,
  getLeadActivitiesFromDB,
  getContactActivitiesFromDB,
  getCustomerActivitiesFromDB,
  getActivitiesByActionFromDB,
  getActivitiesByTypeFromDB,
  addActivityToDB as createActivityInDB,
  manualAddActivityToDB as createManualActivityInDB,
  updateActivityFromDB,
  deleteActivityFromDB,
} from "./activities.repository";

import type {
  CreateActivity,
  ManualCreateActivity,
  UpdateActivity,
  ActivityAction,
  ActivityType,
} from "./activities.types";

import activityEventsPublisher from "./activities-events.publisher";

export const getActivitiesService = (
  orgId: string,
  accessToken: string
) =>
  getActivitiesFromDB(
    orgId,
    accessToken
  );

export const getActivityByIDService = (
  id: string,
  orgId: string,
  accessToken: string
) =>
  getActivityByIDFromDB(
    id,
    orgId,
    accessToken
  );

export const getLeadActivitiesService = (
  orgId: string,
  leadId: string,
  accessToken: string
) =>
  getLeadActivitiesFromDB(
    orgId,
    leadId,
    accessToken
  );

export const getContactActivitiesService = (
  orgId: string,
  contactId: string,
  accessToken: string
) =>
  getContactActivitiesFromDB(
    orgId,
    contactId,
    accessToken
  );

export const getCustomerActivitiesService = (
  orgId: string,
  customerId: string,
  accessToken: string
) =>
  getCustomerActivitiesFromDB(
    orgId,
    customerId,
    accessToken
  );

export const getActivitiesByActionService = (
  orgId: string,
  action: ActivityAction,
  accessToken: string
) =>
  getActivitiesByActionFromDB(
    orgId,
    action,
    accessToken
  );

export const getActivitiesByTypeService = (
  orgId: string,
  type: ActivityType,
  accessToken: string
) =>
  getActivitiesByTypeFromDB(
    orgId,
    type,
    accessToken
  );

export const addActivityService = async (
  orgId: string,
  memberId: string,
  activity: CreateActivity,
  accessToken: string
) => {
  const data = await createActivityInDB(
    orgId,
    memberId,
    activity,
    accessToken
  );

  await activityEventsPublisher.created(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const manualAddActivityService = async (
  orgId: string,
  memberId: string,
  activity: ManualCreateActivity,
  accessToken: string
) => {
  const data =
    await createManualActivityInDB(
      orgId,
      memberId,
      activity,
      accessToken
    );

  await activityEventsPublisher.created(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const updateActivityService = async (
  id: string,
  orgId: string,
  memberId: string,
  activity: UpdateActivity,
  accessToken: string
) => {
  const data =
    await updateActivityFromDB(
      id,
      orgId,
      activity,
      accessToken
    );

  await activityEventsPublisher.updated(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const deleteActivityService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data =
    await deleteActivityFromDB(
      id,
      orgId,
      accessToken
    );

  await activityEventsPublisher.deleted(
    orgId,
    memberId,
    data
  );

  return data;
};