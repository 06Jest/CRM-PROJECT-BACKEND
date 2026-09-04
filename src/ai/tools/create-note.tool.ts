import { addNoteToDB } from "../../services/notes.service";
import { AIToolDefinition } from "./tool.registry";

export const createNoteTool: AIToolDefinition = {
  name: "create_note",

  description:
    "Create a note in the user's CRM. Use this when the user explicitly asks to create or save a note.",

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
    return addNoteToDB(
      context.orgId!,
      context.memberId!,
      {
        target_type: arguments_.target_type as
          | "lead"
          | "contact"
          | "deal"
          | "customer"
          | "personal",

        target_id:
          arguments_.target_id === null
            ? null
            : String(arguments_.target_id),

        title: String(arguments_.title),
        content: String(arguments_.content),

        visibility:
          arguments_.visibility === "public"
            ? "public"
            : "private",
      },
      context.accessToken!
    );
},
};