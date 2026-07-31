import { z } from "zod";

import {
  uuidSchema,
  titleSchema,
  longTextSchema,
  callOutcomeSchema,
  callTypesSchema,
} from "./global.schema";


export const addCallSchema = z.object({
  lead_id: uuidSchema.optional().nullable(),

  contact_id: uuidSchema.optional().nullable(),

  customer_id: uuidSchema.optional().nullable(),

  assigned_to: uuidSchema,

  type: callTypesSchema,

  subject: titleSchema,

  scheduled_for: z.iso.datetime()
    .optional()
    .nullable(),  
});


export const updateCallSchema = z.object({

  assigned_to:
    uuidSchema.optional(),

  subject:
    titleSchema.optional(),

  scheduled_for:
    z.iso.datetime()
      .optional()
      .nullable(),

});


export const endCallSchema = z.object({

  outcome:
    callOutcomeSchema.optional(),

  notes:
    longTextSchema.or(z.literal("")).optional(),

});