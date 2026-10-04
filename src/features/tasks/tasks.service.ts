import {
  addActivityService,
} from "../activities/activities.service";
import { ensureResourceLimit } from "../../services/plans.service";
import { table } from "../../config/tables";
import { AppError } from "../../middleware/error.middleware";
import taskEventsPublisher from "./tasks-events.publisher";

import {
  addTaskToDB,
  archiveTaskFromDB,
  assignTaskFromDB,
  completeTaskFromDB,
  deleteTaskFromDB,
  getTaskByIDFromDB,
  getTasksFromDB,
  updateTaskDueDateFromDB,
  updateTaskFromDB,
  updateTaskPriorityFromDB,
} from "./tasks.repository";

import {
  AddTask,
  TaskListItem,
  TaskPriority,
  UpdateTask,
} from "./tasks.types";

export const getTasksService = async (
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<TaskListItem[]> => {
  return getTasksFromDB(
    orgId,
    memberId,
    accessToken
  );
};

export const getTaskByIDService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<TaskListItem> => {
  return getTaskByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );
};

export const addTaskService = async (
  profileId: string,
  orgId: string,
  memberId: string,
  task: AddTask,
  accessToken: string
): Promise<TaskListItem> => {
  await ensureResourceLimit(
    orgId,
    table.tasks,
    "tasks",
    "active_limit",
    accessToken
  );

  const data = await addTaskToDB(
    profileId,
    orgId,
    memberId,
    task,
    accessToken
  );

  await addActivityService(
    orgId,
    memberId,
    {
      lead_id:
        data.target_type === "lead"
          ? data.target_id
          : undefined,

      contact_id:
        data.target_type === "contact"
          ? data.target_id
          : undefined,

      customer_id:
        data.target_type === "customer"
          ? data.target_id
          : undefined,

      type: "task",
      action: "created",

      title:
        `New task for ${data.assignee.profile.first_name} ${data.assignee.profile.last_name}`,

      target_name:
        `${data.assignee.profile.first_name} ${data.assignee.profile.last_name}`,

      description:
        `Created task "${data.title}"`,
    },
    accessToken
  );

  return data;
};

export const updateTaskService = async (
  id: string,
  orgId: string,
  memberId: string,
  task: UpdateTask,
  accessToken: string
): Promise<TaskListItem> => {
  const check = await getTaskByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  if (check.author_id !== memberId) {
    throw new AppError(
      403,
      "Only the task creator can edit this task"
    );
  }

  return updateTaskFromDB(
    id,
    orgId,
    memberId,
    task,
    accessToken
  );
};

export const assignTaskService = async (
  id: string,
  orgId: string,
  memberId: string,
  assignedTo: string,
  accessToken: string
): Promise<TaskListItem> => {
  const check = await getTaskByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  if (check.author_id !== memberId) {
    throw new AppError(
      403,
      "Only the task creator can assign this task"
    );
  }

  const data = await assignTaskFromDB(
    id,
    orgId,
    memberId,
    assignedTo,
    accessToken
  );

  await taskEventsPublisher.assigned(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const completeTaskService = async (
  id: string,
  orgId: string,
  memberId: string,
  completed: boolean,
  accessToken: string
): Promise<TaskListItem> => {
  const check = await getTaskByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  const isAllowed =
    check.author_id === memberId ||
    check.assigned_to === memberId;

  if (!isAllowed) {
    throw new AppError(
      403,
      "Only the task creator or assignee can complete this task"
    );
  }

  const data = await completeTaskFromDB(
    id,
    orgId,
    memberId,
    completed,
    accessToken
  );

  await taskEventsPublisher.completed(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const updateTaskPriorityService = async (
  id: string,
  orgId: string,
  memberId: string,
  priority: TaskPriority,
  accessToken: string
): Promise<TaskListItem> => {
  const check = await getTaskByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  if (check.author_id !== memberId) {
    throw new AppError(
      403,
      "Only the task creator can update the task priority"
    );
  }

  return updateTaskPriorityFromDB(
    id,
    orgId,
    memberId,
    priority,
    accessToken
  );
};

export const updateTaskDueDateService = async (
  id: string,
  orgId: string,
  memberId: string,
  dueDate: string | null,
  accessToken: string
): Promise<TaskListItem> => {
  const check = await getTaskByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  if (check.author_id !== memberId) {
    throw new AppError(
      403,
      "Only the task creator can update the due date"
    );
  }

  const data = await updateTaskDueDateFromDB(
    id,
    orgId,
    memberId,
    dueDate,
    accessToken
  );

  await taskEventsPublisher.updated(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const archiveTaskService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string> => {
  const data = await archiveTaskFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await taskEventsPublisher.archived(
    orgId,
    memberId,
    data
  );

  return data;
};

export const deleteTaskService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string> => {
  const check = await getTaskByIDFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  if (check.author_id !== memberId) {
    throw new AppError(
      403,
      "Only the task creator can delete this task"
    );
  }

  const data = await deleteTaskFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await taskEventsPublisher.deleted(
    orgId,
    memberId,
    data
  );

  return data;
};