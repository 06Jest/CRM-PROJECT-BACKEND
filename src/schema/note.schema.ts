import { boolean, z } from "zod";

import {
  uuidSchema,
  noteContentSchema,
  noteTargetTypeSchema,
  noteVisibilitySchema,
  titleSchema,
} from "./global.schema";

export const addNoteSchema = z.object({
  target_type: noteTargetTypeSchema,

  target_id: uuidSchema.optional().nullable(),

  title: titleSchema.optional(),

  content: noteContentSchema,

  visibility: noteVisibilitySchema.optional(),
});

export const updateNoteSchema = z.object({
  target_type: noteTargetTypeSchema,

  target_id: uuidSchema.optional().nullable(),

  title: titleSchema.optional(),

  content: noteContentSchema.optional(),

  visibility: noteVisibilitySchema.optional(),
});

export const pinNoteSchema = z.object({

  pinned: z.boolean(),
  
});