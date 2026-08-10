import { z } from "zod";
import { 
  NameSchema,
  phoneSchema,
  uuidSchema,
 } from "./global.schema";


export const updateProfileSchema = z.object({

  first_name: NameSchema.optional(),

  last_name: NameSchema.optional(),

  display_name:  z.string().max(100).optional(),

  phone: phoneSchema.optional(),

  position: z.string().max(50).optional(),

  org_id: uuidSchema,
});

