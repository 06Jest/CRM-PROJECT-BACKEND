import { boolean, z } from "zod";

import {
  uuidSchema,
  noteTargetTypeSchema,
  noteVisibilitySchema,
  titleSchema,
  longTextSchema,
} from "./global.schema";

export const addNoteSchema = z.object({
  target_type: noteTargetTypeSchema,

  target_id: uuidSchema.optional().nullable(),

  title: titleSchema.optional(),

  content: longTextSchema,

  visibility: noteVisibilitySchema.optional(),
});

export const updateNoteSchema = z.object({
  target_type: noteTargetTypeSchema,

  target_id: uuidSchema.optional().nullable(),

  title: titleSchema.optional(),

  content: longTextSchema.optional(),

  visibility: noteVisibilitySchema.optional(),
});

export const pinNoteSchema = z.object({

  pinned: z.boolean(),
  
});