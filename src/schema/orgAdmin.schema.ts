import { z } from "zod";
import { 
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  phoneSchema,
  profileStatusSchema,
  roleSchema,
  avatarSchema,
 } from "./global.schema";

import { uuidSchema } from "./global.schema";

export const addProfileSchema = z.object({

  id: uuidSchema.optional(),

  email: emailSchema,
    
  first_name: firstNameSchema,

  last_name: lastNameSchema,

  display_name:  z.string().max(100).optional(),

  phone: phoneSchema.optional(),

  position: z.string().max(50).optional(),

  org_id: uuidSchema,
});

export const updateProfileSchema = z.object({

  first_name: firstNameSchema.optional(),

  last_name: lastNameSchema.optional(),

  display_name:  z.string().max(100).optional(),

  phone: phoneSchema.optional(),

  position: z.string().max(50).optional(),

  org_id: uuidSchema,
});

export const updateStatusSchema = z.object({
  status: profileStatusSchema,
});

export const updateRoleSchema = z.object({
  role: roleSchema
});

export const updateAvatarSchema = z.object({
  avatar_url: avatarSchema
});





