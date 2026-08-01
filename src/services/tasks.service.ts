import { createSupabaseUserClient } from "../config/supabase";
import { AppError } from "../middleware/error.middleware";
import { table } from "../config/tables";
import {
  AddTask,
  TaskListItem,
  TaskPriority,
  TaskStatus,
  UpdateTask,
} from "../types/task";

const tab = table.tasks;

const fkey = "tasks_author_id_fkey";
const assigneeFkey = "tasks_assigned_to_fkey";

const selectAllWithUsers = `
  *,
  author:profiles!${fkey}(
    id,
    first_name,
    last_name
  ),
  assignee:profiles!${assigneeFkey}(
    id,
    first_name,
    last_name
  )
`;

const all = selectAllWithUsers;


export const getTasksFromDB = async (
  orgId: string,
  userId: string,
  accessToken: string
): Promise<TaskListItem[]> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .or(`author_id.eq.${userId},assigned_to.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch Tasks: ${error.message}`);
  }

  return data ?? [];
};


export const getTaskByIDFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  accessToken: string
): Promise<TaskListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .or(`author_id.eq.${userId},assigned_to.eq.${userId}`)
    .single();

  if (error) {
    throw new AppError(500, `Failed to fetch Task: ${error.message}`);
  }

  return data;
};


export const addTaskToDB = async (
  orgId: string,
  userId: string,
  task: AddTask,
  accessToken: string
): Promise<TaskListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert({
      ...task,
      org_id: orgId,
      author_id: userId,
      assigned_to: task.assigned_to ?? userId,
      updated_by: userId,
    })
    .select(all)
    .single();

  if (error) {
    throw new AppError(500, `Failed to add Task: ${error.message}`);
  }

  return data;
};


export const updateTaskFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  task: UpdateTask,
  accessToken: string
): Promise<TaskListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      ...task,
      updated_by: userId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("author_id", userId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(500, `Failed to update Task: ${error.message}`);
  }

  return data;
};


export const assignTaskFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  assignedTo: string,
  accessToken: string
): Promise<TaskListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      assigned_to: assignedTo,
      updated_by: userId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("author_id", userId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(500, `Failed to assign Task: ${error.message}`);
  }

  return data;
};


export const updateTaskPriorityFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  priority: TaskPriority,
  accessToken: string
): Promise<TaskListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      priority,
      updated_by: userId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .eq("author_id", userId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update Task Priority: ${error.message}`
    );
  }

  return data;
};


export const updateTaskDueDateFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  dueDate: string | null,
  accessToken: string
): Promise<TaskListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      due_date: dueDate,
      updated_by: userId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update Task Due Date: ${error.message}`
    );
  }

  return data;
};


export const completeTaskFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  completed: boolean,
  accessToken: string
): Promise<TaskListItem> => {

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      status: completed ? "completed" : "todo",
      completed_at: completed ? new Date().toISOString() : null,
      updated_by: userId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update Task Completion: ${error.message}`
    );
  }

  return data;
};


export const deleteTaskFromDB = async (
  id: string,
  orgId: string,
  userId: string,
  accessToken: string
): Promise<string> => {

  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: userId,
    })
    .eq("id", id)
    .eq("author_id", userId)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(500, `Failed to delete Task: ${error.message}`);
  }

  return id;
};