export interface TasksState {
  items: TaskListItem[];
  loading: boolean;
  loaded: boolean;
  error: string | null;
}

export const TASK_TARGET_TYPES = [
  "lead",
  "contact",
  "deal",
  "customer",
  "personal",
] as const;

export type TaskTargetType = typeof TASK_TARGET_TYPES[number];

export const TASK_STATUSES = [
  "todo",
  "in_progress",
  "completed",
  "cancelled",
] as const;

export type TaskStatus = typeof TASK_STATUSES[number];

export const TASK_PRIORITIES = [
  "low",
  "medium",
  "high",
  "urgent",
] as const;

export type TaskPriority = typeof TASK_PRIORITIES[number];

export const TASK_VISIBILITIES = [
  "public",
  "private",
] as const;

export type TaskVisibility = typeof TASK_VISIBILITIES[number];

export interface Task {
  id: string;
  org_id: string;
  title: string;
  description: string;
  target_type: TaskTargetType;
  target_id: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  visibility: TaskVisibility;
  author_id: string;
  assigned_to: string;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  updated_by: string | null;
  deleted_at: string | null;
  deleted_by: string |null;
}

export interface AddTask {
  title: string;
  description: string;
  target_type: TaskTargetType;
  target_id: string | null;
  priority?: TaskPriority;
  visibility?: TaskVisibility;
  assigned_to?: string;
  due_date?: string | null;
}


export interface UpdateTask {
  title: string;
  description: string;
  target_type: TaskTargetType;
  target_id: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  visibility?: TaskVisibility;
  assigned_to?: string;
  due_date?: string | null;
}

export interface TaskListItem extends Task {
  author: {
    id: string;
    first_name: string;
    last_name: string;
  };

  assignee: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

create table public.tasks (
  id uuid not null default gen_random_uuid (),
  org_id uuid not null,
  author_id uuid not null,
  assigned_to uuid not null,
  target_type character varying(20) not null,
  target_id uuid null,
  title text not null,
  description text not null default ''::text,
  status character varying(20) not null default 'todo'::character varying,
  priority character varying(20) not null default 'medium'::character varying,
  visibility character varying(20) not null default 'private'::character varying,
  due_date timestamp with time zone null,
  reminder_at timestamp with time zone null,
  completed_at timestamp with time zone null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  updated_by uuid null,
  deleted_at timestamp with time zone null,
  deleted_by uuid null,
  constraint tasks_pkey primary key (id),
  constraint tasks_deleted_by_fkey foreign KEY (deleted_by) references profiles (id),
  constraint tasks_org_id_fkey foreign KEY (org_id) references organizations (id),
  constraint tasks_updated_by_fkey foreign KEY (updated_by) references profiles (id),
  constraint tasks_assigned_to_fkey foreign KEY (assigned_to) references profiles (id),
  constraint tasks_author_id_fkey foreign KEY (author_id) references profiles (id),
  constraint tasks_visibility_check check (
    (
      (visibility)::text = any (
        (
          array[
            'public'::character varying,
            'private'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint tasks_priority_check check (
    (
      (priority)::text = any (
        (
          array[
            'low'::character varying,
            'medium'::character varying,
            'high'::character varying,
            'urgent'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint tasks_status_check check (
    (
      (status)::text = any (
        (
          array[
            'todo'::character varying,
            'in_progress'::character varying,
            'completed'::character varying,
            'cancelled'::character varying
          ]
        )::text[]
      )
    )
  ),
  constraint tasks_target_type_check check (
    (
      (target_type)::text = any (
        (
          array[
            'lead'::character varying,
            'contact'::character varying,
            'deal'::character varying,
            'customer'::character varying,
            'personal'::character varying
          ]
        )::text[]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists tasks_org_idx on public.tasks using btree (org_id) TABLESPACE pg_default;

create index IF not exists tasks_target_idx on public.tasks using btree (target_type, target_id) TABLESPACE pg_default;

create index IF not exists tasks_author_idx on public.tasks using btree (author_id) TABLESPACE pg_default;

create index IF not exists tasks_assigned_to_idx on public.tasks using btree (assigned_to) TABLESPACE pg_default;

create index IF not exists tasks_status_idx on public.tasks using btree (status) TABLESPACE pg_default;

create index IF not exists tasks_due_date_idx on public.tasks using btree (due_date) TABLESPACE pg_default;

create index IF not exists tasks_priority_idx on public.tasks using btree (priority) TABLESPACE pg_default;

create trigger set_tasks_updated_at BEFORE
update on tasks for EACH row
execute FUNCTION auto_update_updated_at (); 


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

import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";

import {
  getTasksFromDB,
  getTaskByIDFromDB,
  addTaskToDB,
  updateTaskFromDB,
  completeTaskFromDB,
  assignTaskFromDB,
  updateTaskDueDateFromDB,
  updateTaskPriorityFromDB,
  getOverdueTasksFromDB,
  getDueTodayTasksFromDB,
  getTasksByAssigneeFromDB,
  getTasksByPriorityFromDB,
  getTasksByStatusFromDB,
} from "../services/tasks.service";
import { TaskPriority, TaskStatus } from "../types/task";

export const getTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const tasks = await getTasksFromDB(orgId, userId);

    return res.status(200).json({
      success: true,
      message: "Tasks fetch successful",
      data: tasks,
    });
  } catch (err) {
    next(err);
  }
};

export const getTaskByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTaskByIDFromDB(id, orgId, userId);

    return res.status(200).json({
      success: true,
      message: "Task fetch successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const addTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    const task = req.body;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await addTaskToDB(orgId, userId, task);

    return res.status(201).json({
      success: true,
      message: "Add Task successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const task = req.body;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(403, "Only the task creator can edit this task");
    }

    const data = await updateTaskFromDB(
      id,
      orgId,
      userId,
      task
    );

    return res.status(200).json({
      success: true,
      message: "Update Task successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const assignTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { assigned_to } = req.body;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(
        403,
        "Only the task creator can assign this task"
      );
    }

    const data = await assignTaskFromDB(
      id,
      orgId,
      userId,
      assigned_to
    );

    return res.status(200).json({
      success: true,
      message: "Task assigned successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const completeTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { completed } = req.body;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    const isAllowed =
      check.author_id === userId ||
      check.assigned_to === userId;

    if (!isAllowed) {
      throw new AppError(
        403,
        "Only the task creator or assignee can complete this task"
      );
    }

    const data = await completeTaskFromDB(
      id,
      orgId,
      userId,
      completed
    );

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTaskPriority = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { priority } = req.body;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(
        403,
        "Only the task creator can update the task priority"
      );
    }

    const data = await updateTaskPriorityFromDB(
      id,
      orgId,
      userId,
      priority
    );

    return res.status(200).json({
      success: true,
      message: "Task priority updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTaskDueDate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { due_date } = req.body;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getTaskByIDFromDB(id, orgId, userId);

    if (check.author_id !== userId) {
      throw new AppError(
        403,
        "Only the task creator can update the due date"
      );
    }

    const data = await updateTaskDueDateFromDB(
      id,
      orgId,
      userId,
      due_date
    );

    return res.status(200).json({
      success: true,
      message: "Task due date updated successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { status } = req.params;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTasksByStatusFromDB(
      orgId,
      userId,
      status as TaskStatus
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByPriority = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { priority } = req.params;

    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTasksByPriorityFromDB(
      orgId,
      userId,
      priority as TaskPriority
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getTasksByAssignee = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const assignedTo = uuidSchema.parse(req.params.assignedTo);

    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getTasksByAssigneeFromDB(
      orgId,
      assignedTo
    );

    return res.status(200).json({
      success: true,
      message: "Tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getDueTodayTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getDueTodayTasksFromDB(
      orgId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Due today tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

export const getOverdueTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getOverdueTasksFromDB(
      orgId,
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Overdue tasks fetched successfully",
      data,
    });
  } catch (err) {
    next(err);
  }
};

import { z } from "zod";
import { GENDERS, PREFERRED_CONTACT_TIMES, PRIORITIES, ROLES, SOURCES, SUFFIXES } from "../types/global";
import { CONTACT_STATUSES } from "../types/contact";
import { LEAD_STATUSES } from "../types/lead";
import { DEAL_STAGES } from "../types/deal";
import { PROFILE_STATUSES } from "../types/profile";
import { CUSTOMER_STATUSES } from "../types/customer";
import { NOTE_TARGET_TYPES, NOTE_VISIBILITIES } from "../types/note";
import { EMAIL_PROVIDERS, EMAIL_STATUSES } from "../types/email";
import { TASK_PRIORITIES, TASK_STATUSES, TASK_TARGET_TYPES } from "../types/task";

export const sourceSchema = z.enum(SOURCES);

export const contactStatusSchema = z.enum(CONTACT_STATUSES);

export const leadStatusSchema = z.enum(LEAD_STATUSES);

export const CustomerStatusSchema = z.enum(CUSTOMER_STATUSES);

export const dealStageSchema = z.enum(DEAL_STAGES);

export const profileStatusSchema = z.enum(PROFILE_STATUSES);

export const roleSchema = z.enum(ROLES);

export const genderSchema = z.enum(GENDERS);

export const prioritySchema = z.enum(PRIORITIES);

export const suffixSchema = z.enum(SUFFIXES);

export const noteVisibilitySchema = z.enum(NOTE_VISIBILITIES);

export const noteTargetTypeSchema = z.enum(NOTE_TARGET_TYPES);

export const preferedTimeSchema = z.enum(PREFERRED_CONTACT_TIMES);

export const emailStatusSchema = z.enum(EMAIL_STATUSES);

export const taskStatusSchema = z.enum(TASK_STATUSES);

export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

export const taskTargetTypeSchema = z.enum(TASK_TARGET_TYPES);

export const emailProviderSchema = z.enum(EMAIL_PROVIDERS);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 12 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const emailSchema = z
  .email("Invalid email address")
  .trim();

export const firstNameSchema = z
  .string()
  .trim()
  .min(2, "Please provide a valid First Name.")
  .max(50)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const lastNameSchema = z
  .string()
  .trim()
  .min(2, "Please provide a valid Last Name.")
  .max(50)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const orgNameSchema = z
  .string()
  .trim()
  .min(3, "Please provide a valid Organization Name.")
  .max(100)
  

export const uuidSchema = z
  .uuid("Invalid ID");

export const phoneSchema = z
  .string()
  .regex(/^09\d{9}$/, "Invalid Philippine mobile number");

export const avatarSchema = z
  .url("Avatar URL must be a valid URL.");

export const birthdateSchema = z
  .iso
  .date()
  .refine(
    (date) => new Date(date) <= new Date(),
    {
      message: "Birthdate cannot be in the future.",
    }
  ).nullable();

export const companyNameSchema = z
  .string()
  .trim()
  .max(100);

export const industrySchema = z
  .string()
  .trim()
  .max(100);

export const positionSchema = z
  .string()
  .trim()
  .max(50)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const departmentSchema = z
  .string()
  .trim()
  .max(50)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const websiteSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\/.+/i.test(value),
    {
      message: "Website must start with http:// or https://",
    }
  );


export const longTextSchema = z
  .string()
  .trim()
  .min(1)
  .max(5000);

export const displayNameSchema = z
  .string()
  .trim()
  .max(100);

export const titleSchema = z
  .string()
  .trim()
  .max(150)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const valueSchema = z
  .number()
  .nonnegative("Deal value cannot be negative.")
  .max(999_999_999.99, "Value is too large.");

export const socialUsernameSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || /^[A-Za-z0-9._-]{2,100}$/.test(value),
    {
      message: "Invalid username.",
    }
  ).transform((value) => (value === "" ? null : value));;

 export const messagingNumberSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || /^\+?[0-9]{7,15}$/.test(value),
    {
      message: "Invalid phone number.",
    }
  ).transform((value) => (value === "" ? null : value));;

  export const noteContentSchema = z
  .string()
  .trim()
  .min(1, "Note cannot be empty.")
  .max(5000, "Note cannot exceed 5000 characters.");

  export const emailSubjectSchema = z
  .string()
  .trim()
  .min(1, "Subject is required.")
  .max(200, "Subject is too long.");


export const emailBodySchema = z
  .string()
  .trim()
  .min(1, "Email body cannot be empty.")
  .max(50000, "Email body is too long.");


export const previewTextSchema = z
  .string()
  .trim()
  .max(300);


export const senderNameSchema = z
  .string()
  .trim()
  .max(100);


export const senderEmailSchema = z
  .email("Invalid sender email.")
  .trim();

  import { z } from "zod";

import {
  uuidSchema,
  titleSchema,
  noteContentSchema,
  taskPrioritySchema,
  taskStatusSchema,
  taskTargetTypeSchema,
} from "./global.schema";

export const addTaskSchema = z.object({
  title: titleSchema,

  description: noteContentSchema.optional(),

  target_type: taskTargetTypeSchema,

  target_id: uuidSchema.optional().nullable(),

  assigned_to: uuidSchema.optional().nullable(),

  due_date: z.iso.datetime().optional().nullable(),

  priority: taskPrioritySchema.optional(),
});

export const updateTaskSchema = z.object({
  title: titleSchema.optional(),

  description: noteContentSchema.optional(),

  target_type: taskTargetTypeSchema.optional(),

  target_id: uuidSchema.optional().nullable(),

  assigned_to: uuidSchema.optional().nullable(),

  due_date: z.iso.datetime().optional().nullable(),

  priority: taskPrioritySchema.optional(),
});

export const assignTaskSchema = z.object({
  assigned_to: uuidSchema,
});

export const completeTaskSchema = z.object({
  completed: z.boolean(),
});

export const updateTaskPrioritySchema = z.object({
  priority: taskPrioritySchema,
});

export const updateTaskDueDateSchema = z.object({
  due_date: z.iso.datetime().nullable(),
});

export const getTasksByStatusSchema = z.object({
  status: taskStatusSchema,
});

export const getTasksByPrioritySchema = z.object({
  priority: taskPrioritySchema,
});

export const getTasksByAssigneeSchema = z.object({
  assignedTo: uuidSchema,
});

import { Router } from "express";

import {
  authenticateUser,
  verifyToken,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  getTasks,
  getTaskByID,
  addTask,
  updateTask,
  assignTask,
  completeTask,
  updateTaskPriority,
  updateTaskDueDate,
  getTasksByStatus,
  getTasksByPriority,
  getTasksByAssignee,
  getDueTodayTasks,
  getOverdueTasks,
} from "../controllers/tasks.controller";

import {
  addTaskSchema,
  updateTaskSchema,
  assignTaskSchema,
  completeTaskSchema,
  updateTaskPrioritySchema,
  updateTaskDueDateSchema,
} from "../schema/tasks.schema";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

// Get
router.get("/show-tasks", getTasks);
router.get("/show-task/:id", getTaskByID);

router.get("/show-tasks/status/:status", getTasksByStatus);
router.get("/show-tasks/priority/:priority", getTasksByPriority);
router.get("/show-tasks/assignee/:assignedTo", getTasksByAssignee);

router.get("/show-due-today-tasks", getDueTodayTasks);
router.get("/show-overdue-tasks", getOverdueTasks);

// Create
router.post(
  "/add-task",
  validateBody(addTaskSchema),
  addTask
);

// Update
router.patch(
  "/update-task/:id",
  validateBody(updateTaskSchema),
  updateTask
);

router.patch(
  "/assign-task/:id",
  validateBody(assignTaskSchema),
  assignTask
);

router.patch(
  "/complete-task/:id",
  validateBody(completeTaskSchema),
  completeTask
);

router.patch(
  "/update-task-priority/:id",
  validateBody(updateTaskPrioritySchema),
  updateTaskPriority
);

router.patch(
  "/update-task-due-date/:id",
  validateBody(updateTaskDueDateSchema),
  updateTaskDueDate
);

export default router;

Frontend: 

import type {
  AddTask,
  TaskListItem,
  TaskPriority,
  TaskStatus,
  UpdateTask,
} from '../types/tasks';

import { apiClient } from "./apiClient";

export const fetchTasksAPI = async (): Promise<TaskListItem[]> => {
  const result = await apiClient("/api/tasks/show-tasks", {
    method: "GET",
  });

  return result.data as TaskListItem[];
};

export const fetchTaskByIDAPI = async (
  id: string
): Promise<TaskListItem> => {
  const result = await apiClient(`/api/tasks/show-task/${id}`, {
    method: "GET",
  });

  return result.data as TaskListItem;
};

export const addTaskAPI = async (
  task: AddTask
): Promise<TaskListItem> => {
  const result = await apiClient("/api/tasks/add-task", {
    method: "POST",
    body: JSON.stringify(task),
  });

  return result.data as TaskListItem;
};

export const updateTaskAPI = async (
  id: string,
  task: UpdateTask
): Promise<TaskListItem> => {
  const result = await apiClient(`/api/tasks/update-task/${id}`, {
    method: "PATCH",
    body: JSON.stringify(task),
  });

  return result.data as TaskListItem;
};

export const assignTaskAPI = async (
  id: string,
  assigned_to: string
): Promise<TaskListItem> => {
  const result = await apiClient(`/api/tasks/assign-task/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ assigned_to }),
  });

  return result.data as TaskListItem;
};

export const completeTaskAPI = async (
  id: string,
  completed: boolean
): Promise<TaskListItem> => {
  const result = await apiClient(`/api/tasks/complete-task/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ completed }),
  });

  return result.data as TaskListItem;
};

export const updateTaskPriorityAPI = async (
  id: string,
  priority: TaskPriority
): Promise<TaskListItem> => {
  const result = await apiClient(
    `/api/tasks/update-task-priority/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ priority }),
    }
  );

  return result.data as TaskListItem;
};

export const updateTaskDueDateAPI = async (
  id: string,
  due_date: string | null
): Promise<TaskListItem> => {
  const result = await apiClient(
    `/api/tasks/update-task-due-date/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify({ due_date }),
    }
  );

  return result.data as TaskListItem;
};

export const fetchTasksByStatusAPI = async (
  status: TaskStatus
): Promise<TaskListItem[]> => {
  const result = await apiClient(
    `/api/tasks/show-tasks/status/${status}`,
    {
      method: "GET",
    }
  );

  return result.data as TaskListItem[];
};

export const fetchTasksByPriorityAPI = async (
  priority: TaskPriority
): Promise<TaskListItem[]> => {
  const result = await apiClient(
    `/api/tasks/show-tasks/priority/${priority}`,
    {
      method: "GET",
    }
  );

  return result.data as TaskListItem[];
};

export const fetchTasksByAssigneeAPI = async (
  assignedTo: string
): Promise<TaskListItem[]> => {
  const result = await apiClient(
    `/api/tasks/show-tasks/assignee/${assignedTo}`,
    {
      method: "GET",
    }
  );

  return result.data as TaskListItem[];
};

export const fetchDueTodayTasksAPI = async (): Promise<TaskListItem[]> => {
  const result = await apiClient(
    "/api/tasks/show-due-today-tasks",
    {
      method: "GET",
    }
  );

  return result.data as TaskListItem[];
};

export const fetchOverdueTasksAPI = async (): Promise<TaskListItem[]> => {
  const result = await apiClient(
    "/api/tasks/show-overdue-tasks",
    {
      method: "GET",
    }
  );

  return result.data as TaskListItem[];
};

export const deleteTaskAPI = async (
  id: string
): Promise<string> => {
  const result = await apiClient(`/api/tasks/delete-task/${id}`, {
    method: "DELETE",
  });

  return result.data as string;
};

import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

import type {
  AddTask,
  TasksState,
  UpdateTask,
  TaskPriority,
} from "../types/tasks";

import {
  fetchTasksAPI,
  addTaskAPI,
  updateTaskAPI,
  assignTaskAPI,
  completeTaskAPI,
  updateTaskPriorityAPI,
  updateTaskDueDateAPI,
  deleteTaskAPI,
} from "../services/tasksService";

const initialState: TasksState = {
  items: [],
  loading: false,
  loaded: false,
  error: null,
};

export const fetchTasks = createAsyncThunk(
  "tasks/show-tasks",
  async (_, thunkAPI) => {
    try {
      return await fetchTasksAPI();
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue("Failed to fetch tasks");
    }
  }
);

export const addTask = createAsyncThunk(
  "tasks/add-task",
  async (task: AddTask, thunkAPI) => {
    try {
      return await addTaskAPI(task);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const updateTask = createAsyncThunk(
  "tasks/update-task",
  async (
    {
      id,
      task,
    }: {
      id: string;
      task: UpdateTask;
    },
    thunkAPI
  ) => {
    try {
      return await updateTaskAPI(id, task);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const assignTask = createAsyncThunk(
  "tasks/assign-task",
  async (
    {
      id,
      assigned_to,
    }: {
      id: string;
      assigned_to: string;
    },
    thunkAPI
  ) => {
    try {
      return await assignTaskAPI(id, assigned_to);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const completeTask = createAsyncThunk(
  "tasks/complete-task",
  async (
    {
      id,
      completed,
    }: {
      id: string;
      completed: boolean;
    },
    thunkAPI
  ) => {
    try {
      return await completeTaskAPI(id, completed);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const updateTaskPriority = createAsyncThunk(
  "tasks/update-task-priority",
  async (
    {
      id,
      priority,
    }: {
      id: string;
      priority: TaskPriority;
    },
    thunkAPI
  ) => {
    try {
      return await updateTaskPriorityAPI(id, priority);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const updateTaskDueDate = createAsyncThunk(
  "tasks/update-task-due-date",
  async (
    {
      id,
      due_date,
    }: {
      id: string;
      due_date: string | null;
    },
    thunkAPI
  ) => {
    try {
      return await updateTaskDueDateAPI(id, due_date);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

export const deleteTask = createAsyncThunk(
  "tasks/delete-task",
  async (id: string, thunkAPI) => {
    try {
      return await deleteTaskAPI(id);
    } catch (err) {
      if (err instanceof Error) {
        return thunkAPI.rejectWithValue(err.message);
      }

      return thunkAPI.rejectWithValue("Something went wrong");
    }
  }
);

const tasksSlice = createSlice({
  name: "tasks",
  initialState,

  reducers: {
    clearError(state) {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder.addCase(fetchTasks.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.loading = false;
      state.loaded = true;
      state.items = action.payload;
    });

    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(addTask.pending, (state) => {
      state.error = null;
    });

    builder.addCase(addTask.fulfilled, (state, action) => {
      state.items.unshift(action.payload);
      state.loading = false;
    });

    builder.addCase(addTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    builder.addCase(updateTask.pending, (state) => {
      state.error = null;
    });

    builder.addCase(updateTask.fulfilled, (state, action) => {
      const index = state.items.findIndex(
        (t) => t.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }

      state.loading = false;
    });

    builder.addCase(updateTask.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(assignTask.pending, (state) => {
      state.error = null;
    });

    builder.addCase(assignTask.fulfilled, (state, action) => {
      const index = state.items.findIndex(
        (t) => t.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }

      state.loading = false;
    });

    builder.addCase(assignTask.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(completeTask.pending, (state) => {
      state.error = null;
    });

    builder.addCase(completeTask.fulfilled, (state, action) => {
      const index = state.items.findIndex(
        (t) => t.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }

      state.loading = false;
    });

    builder.addCase(completeTask.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(updateTaskPriority.pending, (state) => {
      state.error = null;
    });

    builder.addCase(updateTaskPriority.fulfilled, (state, action) => {
      const index = state.items.findIndex(
        (t) => t.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }

      state.loading = false;
    });

    builder.addCase(updateTaskPriority.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(updateTaskDueDate.pending, (state) => {
      state.error = null;
    });

    builder.addCase(updateTaskDueDate.fulfilled, (state, action) => {
      const index = state.items.findIndex(
        (t) => t.id === action.payload.id
      );

      if (index !== -1) {
        state.items[index] = action.payload;
      }

      state.loading = false;
    });

    builder.addCase(updateTaskDueDate.rejected, (state, action) => {
      state.error = action.payload as string;
    });

    builder.addCase(deleteTask.pending, (state) => {
      state.error = null;
      state.loading = true;
    });

    builder.addCase(deleteTask.fulfilled, (state, action) => {
      state.items = state.items.filter(
        (t) => t.id !== action.payload
      );

      state.loading = false;
    });

    builder.addCase(deleteTask.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearError } = tasksSlice.actions;

export default tasksSlice.reducer;


This is the notes panel: import { useState, useMemo, useEffect } from "react";
import {
  Box,
  TextField,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  InputAdornment,
  Divider,
  Paper,
  CircularProgress,
  Tooltip,
  FormControl,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LockIcon from "@mui/icons-material/Lock";
import PublicIcon from "@mui/icons-material/Public";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckIcon from '@mui/icons-material/Check';
import PushPinIcon from '@mui/icons-material/PushPin';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import type { AppDispatch, RootState } from "../../store/store";
import { useDispatch, useSelector } from "react-redux";
import {
  addNote,
  deletePrivateNote,
  updateNote,
  fetchNotes,
  pinNote,
  clearError,
} from "../../store/notesSlice";
import type { NoteListItem, NoteTargetType, NoteVisibility } from "../../types/notes";
import ErrorAlert from "../Error";
import { fetchContactsLists } from "../../store/contactsSlice";
import { fetchLeadsLists } from "../../store/leadsSlice";
import { fetchDealsLists } from "../../store/dealsSlice";
import { fetchCustomersLists } from "../../store/customersSlice";
import { formatName, formatShortTitle, formatTitle } from "../../utils/formatText";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";

export default function NotesPanel() {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  
  const { items: notes, loading: nL, loaded: nLd, error } = useSelector(
    (state: RootState) => state.notes
  );
  const { items: contacts, loaded: cLd } = useSelector((s: RootState) => s.contacts);
  const { items: leads,  loaded:lLd } = useSelector((s: RootState) => s.leads);
  const { items: deals,  loaded: dLd } = useSelector((s: RootState) => s.deals);
  const { items: customers,  loaded: cuLd } = useSelector((s: RootState) => s.customers);

  const contactsMap = useMemo(
  () => new Map(contacts.map(c => [c.id, c])),
  [contacts]
);

  const leadsMap = useMemo(
    () => new Map(leads.map(l => [l.id, l])),
    [leads]
  );

  const dealsMap = useMemo(
    () => new Map(deals.map(d => [d.id, d])),
    [deals]
  );

  const customersMap = useMemo(
    () => new Map(customers.map(c => [c.id, c])),
    [customers]
  );

  const { user } = useAuth();
  const userId = user?.id;

  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "editor">("list");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editVisibility, setEditVisibility] = useState<NoteVisibility>("private");
  const [saving, setSaving] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | NoteVisibility>("all");
  const [targetFilter, setTargetFilter] = useState<"all" | NoteTargetType>("all");
  const [targetType, setTargetType] = useState<NoteTargetType>("personal");
  const [selectedNote, setSelectedNote] = useState<NoteListItem | null>();
  const [openDelete, setOpenDelete] = useState(false);

const [targetId, setTargetId] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        if (!nLd) await dispatch(fetchNotes()).unwrap();
        if (!cLd) await dispatch(fetchContactsLists()).unwrap();
        if (!lLd) await dispatch(fetchLeadsLists()).unwrap();
        if (!dLd) await dispatch(fetchDealsLists()).unwrap();
        if (!cuLd) await dispatch(fetchCustomersLists()).unwrap();
      } catch {
        // Error handled by Redux state
      } 
    };
    loadData();
  }, [nLd, cLd, lLd, dLd, cuLd, dispatch]);

  const refresh = async () => {
    try {
      await dispatch(fetchNotes()).unwrap();
    } catch {
      // Error handled by Redux state
    }
  };

  const activeNote = notes.find((n) => n.id === activeId) ?? null;

  const openNewNote = () => {
    setActiveId(null);
    setEditText("");
    setEditVisibility("private");
    setView("editor");
    setTargetType("personal");
    setTargetId("");
  };

  const openExistingNote = (note: NoteListItem) => {
    setActiveId(note.id);
    handleEditNote(note);
    setView("editor");
  };


const removeNote = async (note: NoteListItem) => {
  const isAuthor = note.author_id === userId;

  try {
    if (!isAuthor) {
      return;
    } else {
      await dispatch(deletePrivateNote(note.id)).unwrap();
    }
  } catch {
    return;
  }

  if (activeId === note.id) {
    setView("list");
    setActiveId(null);
    setEditText("");
  }
};

 

  const handleEditNote = (note: NoteListItem) => {
    setTargetType(note.target_type);
    setTargetId(note.target_id ?? "");
    setEditVisibility(note.visibility);
    setEditText(note.content);
    setEditTitle(note.title);
  };

  const canSave =
    editText.trim().length > 0 &&
    (targetType === "personal" || targetId.length > 0);


  const items = useMemo(() => {
    switch (targetType) {
      case "contact":
        return contacts.map(c => ({
          id: c.id,
          label: `${c.first_name} ${c.last_name}`,
        }));

      case "lead":
        return leads.map(l => ({
          id: l.id,
          label:  `${l.first_name} ${l.last_name}`
        }));

      case "deal":
        return deals.map(d => ({
          id: d.id,
          label:  d.title.length > 25
            ? `${formatTitle(d.title).slice(0, 25)}...`
            : formatTitle(d.title).toUpperCase()
        }));

      case "customer":
        return customers.map((c) => {
          const con = contacts.find((co) => co.id === c.contact_id);

          return {
            id: c.id,
            label: con
              ? `${con.first_name} ${con.last_name}`
              : "Unknown Contact",
          };
        });
      default:
        return [];
    }
  }, [targetType, contacts, leads, deals, customers]);

   

   const saveAndExit = async () => {
    const content = editText.trim();

    if (!content) {
      if (activeNote) {
        await removeNote(activeNote);
      } else {
        setView("list");
        setActiveId(null);
      }
      return;
    }
     setSaving(true);
    try {
      if (activeId) {
        await dispatch(
          updateNote({
            id: activeId,
            note: {
              title: editTitle,
              content,
              visibility: editVisibility,
              target_type: targetType,
              target_id: targetType === "personal" ? null : targetId,
            }
          })
        ).unwrap();
      } else {
        await dispatch(
          addNote({
            title: editTitle,
            content,
            visibility: editVisibility,
            target_type: targetType,
            target_id: targetType === "personal" ? null : targetId
          })
        ).unwrap();
      }
      setView("list");
      setActiveId(null);
      setEditText("");
      setEditVisibility("private");
      setTargetType("personal");
      setTargetId("");
    } catch {
      // error in state
    } finally {
      setSaving(false);
    }
  };

  const getValue = (type: NoteTargetType, id: string) => {
  if (type === "contact") {
    const value = contactsMap.get(id);
    if (!value) return "";
    return formatName(value.first_name, value.last_name);
  }

  if (type === "lead") {
    const value = leadsMap.get(id);
    if (!value) return "";
    return formatName(value.first_name, value.last_name);
  }

  if (type === "deal") {
    const deal = dealsMap.get(id);
    if (!deal) return "";

    const contact = contactsMap.get(deal.contact_id);
    if (!contact) return "";

    return `${formatName(contact.first_name, contact.last_name)} : ${formatShortTitle(deal.title)}`;
  }

  if (type === "customer") {
    const customer = customersMap.get(id);
    if (!customer) return "";

    const contact = contactsMap.get(customer.contact_id);
    if (!contact) return "";

    return formatName(contact.first_name, contact.last_name);
  }
  return "";
};

  const visibleNotes = useMemo(() => {
    const search = query.trim().replace(/\s+/g, " ").toLowerCase();

    return notes
      .filter((note) => {
        const updated = new Date(note.updated_at);

        const searchableFields = [
          note.title,
          note.target_type,
          note.visibility,
          getValue(note.target_type, note.target_id),

          
          updated.toLocaleDateString("en-US"), 
          updated.toLocaleDateString("en-US", { month: "short" }), 
          updated.toLocaleDateString("en-US", { month: "long" }), 
          updated.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }), 
          updated.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
          }), 
          String(updated.getDate()), 
          String(updated.getFullYear()),
        ];

        const matchesSearch =
          !search ||
          searchableFields.some((field) =>
            field.toLowerCase().includes(search)
          );

        const matchesVisibility =
          visibilityFilter === "all" ||
          note.visibility === visibilityFilter;

        const matchesTarget =
          targetFilter === "all" ||
          note.target_type === targetFilter;

        return matchesSearch && matchesVisibility && matchesTarget;
      })
      .sort((a, b) => {
        if (a.pinned !== b.pinned) {
          return Number(b.pinned) - Number(a.pinned);
        }

        return (
          new Date(b.updated_at).getTime() -
          new Date(a.updated_at).getTime()
        );
      });
  }, [notes, query, visibilityFilter, targetFilter,]);

  const canEdit = !activeNote || activeNote?.author_id === userId;

  const handleOpenDelete = (note: NoteListItem) => {
      setSelectedNote(note); 
      setOpenDelete(true);
  };

  

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {view === "list" && (
        <>
          {error && (
              <Box sx={{ width: "100%", my: 1 }}>
                <ErrorAlert message={error} />
              </Box>
            )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            
            <Tooltip title="Refresh">
              <span>
                { nL ? (
                  <IconButton size="small" disabled={nL}>
                    <CircularProgress size={15} />
                  </IconButton>
                ):(
                  <IconButton size="small" onClick={refresh} disabled={nL}>
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                )}
                
              </span>
            </Tooltip>
            <TextField
              size="small"
              fullWidth
              placeholder="Search notes..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Box>

          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: 'center', mb: 1 }}>
              <Paper title="Add Note" elevation={2} sx={{ borderRadius: 10 }}>
                <IconButton color="primary" onClick={() => {
                  dispatch(clearError())
                  openNewNote()
                }}>
                  <AddIcon fontSize="small" />
                </IconButton>
              </Paper>
              <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <FormControl size="small">
                  <Select
                    title="Filter visibility"
                    value={visibilityFilter}
                    onChange={(e) =>
                      setVisibilityFilter(
                        e.target.value as "all" | NoteVisibility
                      )
                    }
                     sx={{
                      width: 80,
                      '& .MuiInputBase-input': {
                          py: '3px',
                          fontSize: 11,
                          fontWeight: 700
                        },
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
                    }}
                  >
                    <MenuItem sx={{ fontSize: 11 }} value="all">All</MenuItem>
                    <MenuItem sx={{ fontSize: 11 }} value="private">Private</MenuItem>
                    <MenuItem sx={{ fontSize: 11 }} value="public">Public</MenuItem>
                  </Select>
                </FormControl>

                <FormControl size="small">
                  <Select
                    title="Filter visibility"
                    value={targetFilter}
                    label="Target"
                    onChange={(e) =>
                      setTargetFilter(
                        e.target.value as "all" | NoteTargetType
                      )
                    }
                    sx={{
                      width: 100,
                      '& .MuiInputBase-input': {
                          py: '3px',
                          fontSize: 11,
                          fontWeight: 700
                        },
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
                    }}
                  >
                    <MenuItem sx={{ fontSize: 11 }} value="all">All</MenuItem>
                    <MenuItem sx={{ fontSize: 11 }} value="personal">Personal</MenuItem>
                    <MenuItem sx={{ fontSize: 11 }} value="contact">Contacts</MenuItem>
                    <MenuItem sx={{ fontSize: 11 }} value="lead">Leads</MenuItem>
                    <MenuItem sx={{ fontSize: 11 }} value="deal">Deals</MenuItem>
                    <MenuItem sx={{ fontSize: 11 }} value="customer">Customers</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Box>

            {nL && !nLd ? (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                <CircularProgress size={22} />
              </Box>
            ) : visibleNotes.length === 0 ? (
              <Typography variant="body2" sx={{ opacity: 0.5, textAlign: "center", mt: 4 }}>
                {notes.length === 0 ? "No notes yet" : "No matches found"}
              </Typography>
            ) : (
              <List
              sx={{ overflowY: 'auto', height: 325}}
              dense disablePadding>
                {visibleNotes.map((note) => {
                  const isPublic =
                    (note as NoteListItem & { visibility?: NoteVisibility }).visibility === "public";
                  return (
                    <ListItem
                      key={note.id}
                      disableGutters
                      onClick={() => openExistingNote(note)}
                      sx={{
                        p: 0,
                        alignItems: "flex-start",
                        borderBottom: "1px solid",
                        borderColor: "#63636322",
                        cursor: "pointer",
                        borderRadius: 1,
                        "&:hover": { bgcolor: "action.hover" },
                      }}
                    >
                      <ListItemText
                        primary={
                          <Box sx={{ display: "flex", alignItems: "center",justifyContent: 'space-between' , gap: 0.5, mr: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center'}}>
                              {isPublic ? (
                                <PublicIcon sx={{ fontSize: 13, opacity: 0.5 }} />
                              ) : (
                                <LockIcon sx={{ fontSize: 13, opacity: 0.5 }} />
                              )}
                              
                              <Typography
                                component="span"
                                sx={{
                                  ml: 1,
                                  fontSize: "0.85rem",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  display: "-webkit-box",
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: "vertical",
                                }}
                              >
                                {formatShortTitle(note.title) } 
                              </Typography>
                              {(note.target_type === 'customer' || note.target_type === 'contact') && (
                              <IconButton 
                              title={`View full details for ${getValue(note.target_type, note.target_id)}`}
                              sx={{p: '3px', ml: '2px', mb: '-5px'}} onClick={(e) => {
                                 e.stopPropagation();
                                 navigate(`/app/${note.target_type}s/${note.target_id}`)
                              }}>
                                <ExitToAppIcon sx={{ fontSize: 13, opacity: 0.5 }} />
                              </IconButton>
                              )}
                            </Box>
                            <Box sx={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: 42}}>
                              <IconButton
                                title="Pin note"
                                onClick={async (e) => {
                                  e.stopPropagation();

                                  await dispatch(
                                    pinNote({
                                      id: note.id,
                                      pinned: !note.pinned,
                                    })
                                  ).unwrap();
                                }}
                                sx={{alignSelf: 'end', p: '2px'}}
                              >
                                {note.pinned ? (
                                  <PushPinIcon sx={{color: 'primary.main', fontSize: '15px'}} />
                                ) : (
                                  <PushPinIcon  sx={{ fontSize: '15px', }}/>
                                )}
                              </IconButton>
                              {note.author_id === userId && (
                              <IconButton sx={{p: '2px'}} onClick={(e) => {
                                e.stopPropagation();
                                handleOpenDelete(note)
                              }}>
                                <DeleteOutlineIcon sx={{ fontSize: '15px', }}/>
                              </IconButton>
                              )}
                            </Box>
                          </Box>
                          
                        }
                       secondary={
                          <Box sx={{ display: 'flex', justifyContent: 'space-between'}}>
                            <Box sx={{display: 'flex'}}>
                              <Typography variant="caption" fontSize="0.7rem" sx={{ ml: 1 }}>
                              • {note.target_type === 'personal' ?`${note.target_type.toUpperCase()}` : `${note.target_type.toUpperCase()} : `}
                            </Typography>
                            <Typography variant="caption" fontSize="0.7rem" sx={{ ml: 1 }}>
                              {getValue(note.target_type, note.target_id)}
                            </Typography>
                            </Box>
                            
                            <Typography variant="caption" fontSize="0.6rem">
                              {new Date(note.updated_at).toLocaleString([], {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                              {`: ${formatName(note.author.first_name, note.author.last_name)}`}
                            </Typography>
                          </Box>
                       }
                        secondaryTypographyProps={{ fontSize: "0.7rem" }}
                      />
                    </ListItem>
                  );
                })}
              </List>
            )}
            <Box sx={{height: 30}}>
            </Box>
          </Box>
        </>
      )}

      {view === "editor" && (
        <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
          {error && (
              <Box sx={{ width: "100%", my: 1 }}>
                <ErrorAlert message={error} />
              </Box>
            )}
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Box sx={{display: 'flex', justifyContent: 'space-between', width: '100%'}}>
              <Box sx={{display: 'flex', justifyContent: 'start', alignItems: 'center'}}>
                <IconButton title="Back" size="small" onClick={() => {
                  setView("list")
                  dispatch(clearError())
                }} disabled={saving}>
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
                <Box sx={{ ml: 1,  opacity: 0.6, width: '100%', display: 'flex', flexDirection: 'space-between' }}>
                  {activeNote ? (
                  <>
                    <Typography sx={{ml: 1, fontSize: '12px', opacity: 0.6,}}>{`${new Date(activeNote.created_at).toLocaleString()}`}</Typography>
                    <Typography sx={{ml: 1, fontSize: '12px', opacity: 0.6,}}> {`Author: ${formatName(activeNote.author.first_name, activeNote.author.last_name)}`}</Typography>
                    </>
                  ): (
                     <Typography sx={{ml: 1,  opacity: 0.6,}}>New Note</Typography>
                  ) }
                </Box>
              </Box>
              
              { canEdit && (
              <IconButton title="Save and Exit" size="small"  disabled={!canSave || saving} onClick={saveAndExit} >
                { !saving ? (
                  <CheckIcon fontSize="small" />
                ) : (
                  <CircularProgress size={14} sx={{ mr: 1, justifySelf: 'self-end' }} />
                )}
              </IconButton>
              )} 
            </Box>
            
            {activeNote && canEdit && (
              <IconButton sx={{opacity: canEdit ? 1 : 0}} size="small" 
              onClick={(e) => {
                e.stopPropagation();
                handleOpenDelete(activeNote)
              }} disabled={saving}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            

            <FormControl size="small">
              <Select
                disabled={!canEdit}
                value={editVisibility}
                label="Visibility"
                onChange={(e) => setEditVisibility(e.target.value as "private" | "public")}
                sx={{
                  width: 80,
                  '& .MuiInputBase-input': {
                      py: '3px',
                      fontSize: 11,
                      fontWeight: 700
                    },
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                <MenuItem sx={{ fontSize: 11 }} value="private">Private</MenuItem>
                <MenuItem sx={{ fontSize: 11 }} value="public">Public</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" >
              <Select
                disabled={!canEdit}
                value={targetType}
                onChange={(e) => {
                  setTargetType(e.target.value as NoteTargetType);
                  setTargetId("");
                }}
                sx={{
                  width: 100,
                  '& .MuiInputBase-input': {
                      py: '3px',
                      fontSize: 11,
                      fontWeight: 700
                    },
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
              >
                <MenuItem sx={{ fontSize: 11 }} value="personal">Personal</MenuItem>
                <MenuItem sx={{ fontSize: 11 }} value="contact">Contacts</MenuItem>
                <MenuItem sx={{ fontSize: 11 }} value="lead">Leads</MenuItem>
                <MenuItem sx={{ fontSize: 11 }} value="deal">Deals</MenuItem>
                <MenuItem sx={{ fontSize: 11 }} value="customer">Customers</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{width: 200}}>
              {targetType !== "personal" && (
              <FormControl size="small" >
                <TextField
                disabled={!canEdit}
                select
                fullWidth
                value={targetId}
                onChange={(e) => setTargetId(e.target.value)}
                sx={{
                  
                  '& .MuiInputBase-input': {
                    py: '3px',
                    fontSize: 11,
                    fontWeight: 700
                  },
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
                }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (selected) => {
                      if (!selected) {
                        return (
                          <span style={{ color: '#999' }}>
                            Choose a target from {targetType}
                          </span>
                        );
                      }

                      const item = items.find((i) => i.id === selected);
                      return item?.label ?? '';
                    },
                    MenuProps: {
                      PaperProps: {
                        sx: {
                          maxHeight: 200,
                          overflowY: 'auto',
                        },
                      },
                    },
                  }}
                >
                  <MenuItem value="" disabled sx={{ fontSize: 11 }}>
                    Choose a target from {targetType}
                  </MenuItem>

                  {items.map((item) => (
                    <MenuItem key={item.id} value={item.id} sx={{ fontSize: 11 }}>
                      {item.label}
                    </MenuItem>
                  ))}
                </TextField>
              </FormControl>
            )}
                {activeNote &&
                  (activeNote.target_type === "customer" ||
                    activeNote.target_type === "contact") && (
                    <IconButton
                    title={`View full details for ${getValue(activeNote.target_type, activeNote.target_id)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/app/${activeNote.target_type}s/${activeNote.target_id}`);
                      }}
                    >
                      <ExitToAppIcon sx={{ fontSize: 13, opacity: 0.5 }} />
                    </IconButton>
                )}
            </Box>
          </Box>
          
          
          <TextField
            disabled={!canEdit}
            size="small"
            fullWidth
            multiline
            placeholder="Title"
            value={formatTitle(editTitle)}
            onChange={(e) => setEditTitle(e.target.value)}
            sx={{
              overflowX: 'auto',
              "& .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&:hover .MuiOutlinedInput-notchedOutline": { border: "none" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: "none" },
              '& .MuiInputBase-input': {
                py: '3px',
                fontSize: 13,
                fontWeight: 700,
                overflowWrap: 'break-word',

              },
            }}
        />

          <Divider sx={{ mb: 1 }} />

          <TextField
            disabled={!canEdit}
            autoFocus
            multiline
            variant="standard"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            InputProps={{ disableUnderline: true }}
            placeholder="Start writing..."
            sx={{
              flex: 1,
              "& .MuiInputBase-root": { height: "100%", alignItems: "flex-start" },
              "& textarea": { height: "100% !important", overflowY: "auto !important" },
            }}
          />
        </Box>
      )}
      <Dialog open={openDelete} onClose={() => setOpenDelete(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>

        <DialogContent>
          Are you sure you want to delete this Note({selectedNote?.title})?
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpenDelete(false)}>
            Cancel
          </Button>

          <Button
            color="error"
            onClick={() => {
              if (!selectedNote) return;
              removeNote(selectedNote);
              setOpenDelete(false);
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
    
  );
}

