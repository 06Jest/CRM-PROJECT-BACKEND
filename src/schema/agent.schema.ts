import { z } from "zod";
import { 
  IDSchema,
  firstNameSchema,
  lastNameSchema,
  phoneSchema,
 } from "./global.schema";

export const uuidSchema = z.object({
  id: IDSchema
});

export const updateProfileSchema = z.object({

  first_name: firstNameSchema.optional,

  last_name: lastNameSchema.optional,

  display_name:  z.string().max(100).optional,

  phone: phoneSchema.optional,

  position: z.string().max(50).optional,

  org_id: IDSchema,
});

