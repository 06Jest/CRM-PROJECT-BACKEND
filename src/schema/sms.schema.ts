import { z } from "zod";

import {
  uuidSchema,
  longTextSchema,
  smsStatusSchema,
} from "./global.schema";


export const addSmsSchema = z
  .object({

    lead_id:
      uuidSchema.optional().nullable(),

    contact_id:
      uuidSchema.optional().nullable(),

    content:
      longTextSchema,

  })
  .refine(
    (data) =>
      !!data.lead_id !==
      !!data.contact_id,
    {
      message:
        "SMS must belong to either a lead or a contact.",
      path: ["lead_id"],
    }
  );


export const updateSmsStatusSchema = z.object({

  status:
    smsStatusSchema,

});