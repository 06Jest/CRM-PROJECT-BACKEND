import { z } from "zod";
import { 
  firstNameSchema,
  lastNameSchema,
  phoneSchema,
  uuidSchema,
 } from "./global.schema";


export const updateProfileSchema = z.object({

  first_name: firstNameSchema.optional(),

  last_name: lastNameSchema.optional(),

  display_name:  z.string().max(100).optional(),

  phone: phoneSchema.optional(),

  position: z.string().max(50).optional(),

  org_id: uuidSchema,
});

