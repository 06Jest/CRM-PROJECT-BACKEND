import { z } from "zod";

import {
  uuidSchema,
  titleSchema,
  taskPrioritySchema,
  taskStatusSchema,
  taskTargetTypeSchema,
  taskVisibilitySchema,
  taskTypesSchema,
  longTextSchema,
  shortTextSchema,
} from "./global.schema";

export const addTaskSchema = z.object({
  title: titleSchema,

  description: shortTextSchema.optional(),
  
  task_type: taskTypesSchema,

  target_type: taskTargetTypeSchema,

  target_id: uuidSchema.optional().nullable(),

  assigned_to: uuidSchema.optional().nullable(),

  due_date: z.iso.datetime().optional().nullable(),

  priority: taskPrioritySchema.optional(),

  visibility: taskVisibilitySchema.optional().nullable()
  
});

export const updateTaskSchema = z.object({
  title: titleSchema.optional(),

  task_type: taskTypesSchema.optional(),

  description: shortTextSchema.optional(),

  target_type: taskTargetTypeSchema.optional(),

  target_id: uuidSchema.optional().nullable(),

  assigned_to: uuidSchema.optional().nullable(),

  due_date: z.iso.datetime().optional().nullable(),

  visibility: taskVisibilitySchema.optional().nullable(),

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