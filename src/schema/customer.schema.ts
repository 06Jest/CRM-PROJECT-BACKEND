import { z } from "zod";
import { 
  notesSchema,
  uuidSchema,
  CustomerStatusSchema,
 } from "./global.schema";


export const addCustomerSchema = z.object({

  contact_id: uuidSchema

})

export const updateCustomerNotesSchema = z.object({

  notes: notesSchema.optional(),

});

export const updateCustomerStatusSchema = z.object({

  status: CustomerStatusSchema.optional(),
  
});

