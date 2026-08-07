import { z } from "zod";

import {
  uuidSchema,
  titleSchema,
  longTextSchema,
  manualActivityActionsSchema,
  manualActivityTypesSchema,
  shortTextSchema,
} from "./global.schema";



export const manualAddActivitySchema = z.object({

  lead_id:
    uuidSchema
      .optional()
      .nullable(),

  contact_id:
    uuidSchema
      .optional()
      .nullable(),

  customer_id:
    uuidSchema
      .optional()
      .nullable(),


  type:manualActivityTypesSchema,


  action: manualActivityActionsSchema,


  title:
    titleSchema,


  description:
    shortTextSchema
      .or(z.literal(""))
      .optional(),

});



export const updateActivitySchema = z.object({

  title:
    titleSchema
      .optional(),


  description:
    shortTextSchema
      .or(z.literal(""))
      .optional(),

});