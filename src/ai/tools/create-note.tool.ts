import z from "zod";
import { addNoteToDB } from "../../services/notes.service";
import {
  AIToolDefinition,
  AIToolError,
} from "./tool.registry";
import { createSupabaseUserClient } from "../../config/supabase";

const createNoteSchema = z.object({
  target_type: z.enum([
    "lead",
    "contact",
    "deal",
    "customer",
    "personal",
  ]),
  target_id: z.string().nullable().optional(),
  title: z.string().trim().min(1).max(200),
  content: z.string().trim().min(1).max(10_000),
  visibility: z.enum(["private", "public"]),
});

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
    throw new Error("Failed to verify target ownership.");
  }

  if (!data) {
    throw new AIToolError(
      `The specified ${targetType} does not belong to the current organization.`
    );
  }
};

export const createNoteTool: AIToolDefinition = {
  name: "create_note",

  description:
    "Create a note in the user's CRM. Use this when the user explicitly asks to create or save a note.",
  
  requiredRoles: ["owner", "manager", "agent"],

  requiresConfirmation: true,

  parameters: {
    target_type: {
      type: "string",
      description:
        "The type of CRM record the note belongs to. Use personal when the note is not attached to a specific CRM record.",
      
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
        "The ID of the CRM record the note belongs to. Use null for personal notes.",
    },

    title: {
      type: "string",
      description: "A short title for the note.",
    },

    content: {
      type: "string",
      description: "The content of the note.",
    },

    visibility: {
      type: "string",
      description: "Whether the note is private or visible to the organization.",
      enum: ["private", "public"],
    },
  },

  async execute(arguments_, context) {
    const parsed = createNoteSchema.safeParse(arguments_);

    if (!parsed.success) {
      throw new AIToolError("Invalid arguments for create_note.");
    }

    const args = parsed.data;

    if (args.target_type === "personal") {
      if (args.target_id) {
        throw new AIToolError(
          "Personal notes cannot have a target_id."
        );
      }
    } else {
      if (!args.target_id) {
        throw new AIToolError(
          `A ${args.target_type} note requires a target_id.`
        );
      }

      if (!context.orgId || !context.accessToken) {
        throw new AIToolError(
          "An organization context is required for CRM notes."
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
        "An access token is required to create a note."
      );
    }

    return addNoteToDB(
      context.profileId,
      context.orgId,
      context.memberId,
      {
        target_type: args.target_type,
        target_id: args.target_id ?? null,
        title: args.title,
        content: args.content,
        visibility: args.visibility,
      },
      context.accessToken
    );

  },
};