import { z } from "zod";

import {
  uuidSchema,
  emailSchema,
  emailSubjectSchema,
  emailBodySchema,
} from "./global.schema";

export const createEmailDraftSchema = z.object({

  lead_id:
    uuidSchema.optional().nullable(),

  contact_id:
    uuidSchema.optional().nullable(),

  customer_id:
    uuidSchema.optional().nullable(),


  recipient_email:
    emailSchema,


  subject:
    emailSubjectSchema,


  body_text:
    emailBodySchema,
  
  body_html:
    emailBodySchema,

}).refine(
  (data) =>
    Number(!!data.lead_id) +
    Number(!!data.contact_id) +
    Number(!!data.customer_id)
    === 1,
  {
    message:
      "Email must belong to exactly one target.",
  }
)

 export const updateEmailDraftSchema = z.object({

  recipient_email:
    emailSchema.optional(),


  subject:
    emailSubjectSchema.optional(),


  body_text:
    emailBodySchema.optional(),
  
  body_html:
    emailBodySchema.optional(),

});

export const emailHistoryParamsSchema = z.object({

  leadId:
    uuidSchema.optional(),

  contactId:
    uuidSchema.optional(),
  
  customerId:
    uuidSchema.optional(),

});

