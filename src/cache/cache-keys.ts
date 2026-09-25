import type { AnalyticsParams } from "../types/analytics";

export const dashboardCacheKey = (
  orgId: string,
  role: string,
  memberId: string
): string => {
  return `dashboard:${orgId}:${role}:${memberId}`;
};

export const dashboardCachePrefix = (orgId: string): string => {
  return `dashboard:${orgId}:`;
};

export const analyticsCacheKey = (
  orgId: string,
  role: string,
  memberId: string,
  filters: AnalyticsParams["filters"],
): string => {
  return `analytics:${orgId}:${role}:${memberId}:${JSON.stringify(filters)}`;
};

export const analyticsCachePrefix = (orgId: string): string => {
  return `analytics:${orgId}:`;
};

export const leadsRawListCacheKey = (
  orgId: string,
  memberId: string
): string => {
  return `leads:raw-list:${orgId}:${memberId}`;
};

export const leadsListCacheKey = (
  orgId: string,
  memberId: string
): string => {
  return `leads:list:${orgId}:${memberId}`;
};

export const leadListCacheKey = (
  orgId: string,
  memberId: string,
  leadId: string
): string => {
  return `leads:list-item:${orgId}:${memberId}:${leadId}`;
};

export const leadCacheKey = (
  orgId: string,
  memberId: string,
  leadId: string
): string => {
  return `leads:item:${orgId}:${memberId}:${leadId}`;
};

export const leadsCachePrefix = (orgId: string): string => {
  return `leads:${orgId}:`;
};

export const contactsRawListCacheKey = (
  orgId: string
): string => `contacts:raw-list:${orgId}`;

export const contactsListCacheKey = (
  orgId: string
): string => `contacts:list:${orgId}`;

export const contactListCacheKey = (
  orgId: string,
  contactId: string
): string => `contacts:list-item:${orgId}:${contactId}`;

export const contactCacheKey = (
  orgId: string,
  contactId: string
): string => `contacts:item:${orgId}:${contactId}`;

export const contactsCachePrefix = (orgId: string): string =>
  `contacts:${orgId}:`;

export const dealsRawListCacheKey = (
  orgId: string
): string => `deals:raw-list:${orgId}`;

export const dealsListCacheKey = (
  orgId: string
): string => `deals:list:${orgId}`;

export const dealListCacheKey = (
  orgId: string,
  dealId: string
): string => `deals:list-item:${orgId}:${dealId}`;

export const dealCacheKey = (
  orgId: string,
  dealId: string
): string => `deals:item:${orgId}:${dealId}`;

export const dealsByContactCacheKey = (
  orgId: string,
  contactId: string
): string => `deals:contact:${orgId}:${contactId}`;

export const dealsCachePrefix = (
  orgId: string
): string => `deals:${orgId}:`;

export const tasksRawListCacheKey = (
  orgId: string,
  memberId: string
): string => `tasks:raw-list:${orgId}:${memberId}`;

export const tasksListCacheKey = (
  orgId: string,
  memberId: string
): string => `tasks:list:${orgId}:${memberId}`;

export const taskListCacheKey = (
  orgId: string,
  memberId: string,
  taskId: string
): string => `tasks:list-item:${orgId}:${memberId}:${taskId}`;

export const taskCacheKey = (
  orgId: string,
  memberId: string,
  taskId: string
): string => `tasks:item:${orgId}:${memberId}:${taskId}`;

export const tasksByContactCacheKey = (
  orgId: string,
  contactId: string
): string => `tasks:contact:${orgId}:${contactId}`;

export const tasksCachePrefix = (
  orgId: string
): string => `tasks:${orgId}:`;

export const notesPublicListCacheKey = (
  orgId: string
): string => `notes:public-list:${orgId}`;

export const notesListCacheKey = (
  orgId: string,
  memberId: string
): string => `notes:list:${orgId}:${memberId}`;

export const notesPrivateListCacheKey = (
  orgId: string,
  memberId: string
): string => `notes:private-list:${orgId}:${memberId}`;

export const noteCacheKey = (
  orgId: string,
  noteId: string
): string => `notes:item:${orgId}:${noteId}`;

export const notesCachePrefix = (
  orgId: string
): string => `notes:${orgId}:`;

export const activitiesRawListCacheKey = (
  orgId: string
): string => `activities:${orgId}:raw-list`;

export const activityCacheKey = (
  orgId: string,
  activityId: string
): string => `activities:${orgId}:item:${activityId}`;

export const leadActivitiesCacheKey = (
  orgId: string,
  leadId: string
): string => `activities:${orgId}:lead:${leadId}`;

export const contactActivitiesCacheKey = (
  orgId: string,
  contactId: string
): string => `activities:${orgId}:contact:${contactId}`;

export const customerActivitiesCacheKey = (
  orgId: string,
  customerId: string
): string => `activities:${orgId}:customer:${customerId}`;

export const activitiesByActionCacheKey = (
  orgId: string,
  action: string
): string => `activities:${orgId}:action:${action}`;

export const activitiesByTypeCacheKey = (
  orgId: string,
  type: string
): string => `activities:${orgId}:type:${type}`;

export const activitiesCachePrefix = (
  orgId: string
): string => `activities:${orgId}:`;

export const callsListCacheKey = (
  orgId: string
): string => `calls:${orgId}:list`;

export const callCacheKey = (
  orgId: string,
  callId: string
): string => `calls:${orgId}:item:${callId}`;

export const leadCallsCacheKey = (
  orgId: string,
  leadId: string
): string => `calls:${orgId}:lead:${leadId}`;

export const contactCallsCacheKey = (
  orgId: string,
  contactId: string
): string => `calls:${orgId}:contact:${contactId}`;

export const callsCachePrefix = (
  orgId: string
): string => `calls:${orgId}:`;

export const customersRawListCacheKey = (
  orgId: string
): string => `customers:${orgId}:raw-list`;

export const customersListCacheKey = (
  orgId: string
): string => `customers:${orgId}:list`;

export const customerListCacheKey = (
  orgId: string,
  customerId: string
): string => `customers:${orgId}:list-item:${customerId}`;

export const customerCacheKey = (
  orgId: string,
  customerId: string
): string => `customers:${orgId}:item:${customerId}`;

export const customersCachePrefix = (
  orgId: string
): string => `customers:${orgId}:`;

