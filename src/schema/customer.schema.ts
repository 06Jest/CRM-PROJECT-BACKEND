import { z } from "zod";
import { 
  uuidSchema,
  CustomerStatusSchema,
  longTextSchema,
 } from "./global.schema";


export const addCustomerSchema = z.object({

  contact_id: uuidSchema,

  assigned_to: uuidSchema.optional().nullable().or(z.literal("")),

})

export const updateCustomerNotesSchema = z.object({

  notes: longTextSchema.optional(),

});

export const updateCustomerStatusSchema = z.object({

  status: CustomerStatusSchema.optional(),
  
});

