import { supabaseAdmin } from '../config/supabase'; 
import { AppError } from '../middleware/error.middleware'; 
import { table } from '../config/tables';
import { AddTask, TaskListItem, TaskPriority, TaskStatus, UpdateTask } from '../types/task';


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
  userId: string
): Promise<TaskListItem[]> => {
  const { data, error } = await supabaseAdmin
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
  userId: string
): Promise<TaskListItem> => {
  const { data, error } = await supabaseAdmin
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
  task: AddTask
): Promise<TaskListItem> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .insert([
      {
        ...task,
        org_id: orgId,
        author_id: userId,
        assigned_to: task.assigned_to ?? userId,
        updated_by: userId,
      },
    ])
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
  task: UpdateTask
): Promise<TaskListItem> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .update({
      ...task,
      updated_by: userId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .eq("author_id", userId)
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
  assignedTo: string
): Promise<TaskListItem> => {
  const { data, error } = await supabaseAdmin
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
  priority: TaskPriority
): Promise<TaskListItem> => {
  const { data, error } = await supabaseAdmin
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
  dueDate: string | null
): Promise<TaskListItem> => {
  const { data, error } = await supabaseAdmin
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
  completed: boolean
): Promise<TaskListItem> => {
  const { data, error } = await supabaseAdmin
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
  userId: string
): Promise<string> => {
  const { error } = await supabaseAdmin
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

export const getTasksByStatusFromDB = async (
  orgId: string,
  userId: string,
  status: TaskStatus
): Promise<TaskListItem[]> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .eq("status", status)
    .is("deleted_at", null)
    .or(`author_id.eq.${userId},assigned_to.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Tasks by Status: ${error.message}`
    );
  }

  return data ?? [];
};

export const getTasksByPriorityFromDB = async (
  orgId: string,
  userId: string,
  priority: TaskPriority
): Promise<TaskListItem[]> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .eq("priority", priority)
    .is("deleted_at", null)
    .or(`author_id.eq.${userId},assigned_to.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Tasks by Priority: ${error.message}`
    );
  }

  return data ?? [];
};

export const getTasksByAssigneeFromDB = async (
  orgId: string,
  assignedTo: string
): Promise<TaskListItem[]> => {
  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .eq("assigned_to", assignedTo)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Tasks by Assignee: ${error.message}`
    );
  }

  return data ?? [];
};

export const getDueTodayTasksFromDB = async (
  orgId: string,
  userId: string
): Promise<TaskListItem[]> => {
  const today = new Date().toISOString().split("T")[0];

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .or(`author_id.eq.${userId},assigned_to.eq.${userId}`)
    .gte("due_date", `${today}T00:00:00.000Z`)
    .lt("due_date", `${today}T23:59:59.999Z`)
    .is("deleted_at", null)
    .order("due_date", { ascending: true });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Due Today Tasks: ${error.message}`
    );
  }

  return data ?? [];
};

export const getOverdueTasksFromDB = async (
  orgId: string,
  userId: string
): Promise<TaskListItem[]> => {
  const now = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .or(`author_id.eq.${userId},assigned_to.eq.${userId}`)
    .lt("due_date", now)
    .neq("status", "completed")
    .is("deleted_at", null)
    .order("due_date", { ascending: true });

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch Overdue Tasks: ${error.message}`
    );
  }

  return data ?? [];
};