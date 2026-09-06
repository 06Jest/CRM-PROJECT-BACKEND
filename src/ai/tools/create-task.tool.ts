import z from "zod";
import { addTaskToDB } from "../../services/tasks.service";
import {
  AIToolDefinition,
  AIToolError,
} from "./tool.registry";
import { createSupabaseUserClient } from "../../config/supabase";
import { addTaskSchema } from "../../schema/tasks.schema";



const verifyTargetOwnership = async (
  targetType: "lead" | "contact" | "deal" | "customer",
  targetId: string,
  orgId: string,
  accessToken: string
): Promise<void> => {
  const tableMap = {
    lead: "leads",
    contact: "contacts",
    deal: "deals",
    customer: "customers",
  } as const;

  const table = tableMap[targetType];

  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(table)
    .select("id")
    .eq("id", targetId)
    .eq("org_id", orgId)
    .maybeSingle();

  if (error) {
    throw new AIToolError(
      "Failed to verify target ownership."
    );
  }

  if (!data) {
    throw new AIToolError(
      `The specified ${targetType} does not belong to the current organization.`
    );
  }
};

export const createTaskTool: AIToolDefinition = {
  name: "create_task",

  description:
    "Create a task in the user's CRM. Use this when the user explicitly asks to create or save a task.",

  requiredRoles: ["owner", "manager", "agent"],

  requiresConfirmation: true,

  parameters: {
    target_type: {
      type: "string",
      description:
        "The type of CRM record the task belongs to. Use personal when the task is not attached to a specific CRM record.",
      enum: [
        "lead",
        "contact",
        "deal",
        "customer",
        "personal",
      ],
    },

    target_id: {
      type: "string",
      nullable: true,
      description:
        "The ID of the CRM record the task belongs to. Use null for personal tasks.",
    },

    title: {
      type: "string",
      description: "A short title for the task.",
    },

    description: {
      type: "string",
      description: "A description of what needs to be done.",
    },

    task_type: {
      type: "string",
      description: "The type of task.",
      enum: [
        "call",
        "email",
        "sms",
        "meeting",
        "other",
      ],
    },

    priority: {
      type: "string",
      description: "The priority of the task.",
      enum: [
        "low",
        "medium",
        "high",
        "urgent",
      ],
    },

    visibility: {
      type: "string",
      description:
        "Whether the task is private or visible to the organization.",
      enum: ["private", "public"],
    },

    assigned_to: {
      type: "string",
      nullable: true,
      description:
        "The organization member ID to assign the task to. Use null for personal tasks.",
    },

    due_date: {
      type: "string",
      nullable: true,
      description:
        "The task due date/time in ISO 8601 format. Use null if there is no due date.",
    },
  },

  async execute(arguments_, context) {
    const parsed = addTaskSchema.safeParse(arguments_);

    if (!parsed.success) {
      throw new AIToolError(
        "Invalid arguments for create_task."
      );
    }

    const args = parsed.data;

    if (args.target_type === "personal") {
      if (args.target_id) {
        throw new AIToolError(
          "Personal tasks cannot have a target_id."
        );
      }

      if (args.assigned_to) {
        throw new AIToolError(
          "Personal tasks cannot be assigned to an organization member."
        );
      }

      if (args.visibility !== "private") {
        throw new AIToolError(
          "Personal tasks must be private."
        );
      }
    } else {
      if (!args.target_id) {
        throw new AIToolError(
          `A ${args.target_type} task requires a target_id.`
        );
      }

      if (!context.orgId || !context.accessToken) {
        throw new AIToolError(
          "An organization context is required for CRM tasks."
        );
      }

      await verifyTargetOwnership(
        args.target_type,
        args.target_id,
        context.orgId,
        context.accessToken
      );
    }

    if (!context.accessToken) {
      throw new AIToolError(
        "An access token is required to create a task."
      );
    }

    return addTaskToDB(
      context.profileId,
      context.orgId,
      context.memberId,
      {
        target_type: args.target_type,
        target_id: args.target_id ?? null,
        title: args.title,
        description: args.description,
        task_type: args.task_type,
        priority: args.priority,
        visibility: args.visibility,
        assigned_to: args.assigned_to ?? null,
        due_date: args.due_date ?? null,
      },
      context.accessToken
    );
  },
};