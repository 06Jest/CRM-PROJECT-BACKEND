import { z } from "zod";
import { 
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  IDSchema,
  phoneSchema,
  profileStatusSchema,
  roleSchema,
  avatarSchema,
 } from "./global.schema";

export const addProfileSchema = z.object({

  id: IDSchema.optional,

  email: emailSchema,
    
  first_name: firstNameSchema,

  last_name: lastNameSchema,

  display_name:  z.string().max(100).optional,

  phone: phoneSchema.optional,

  position: z.string().max(50).optional,

  org_id: IDSchema,
});

export const updateProfileSchema = z.object({

  first_name: firstNameSchema.optional,

  last_name: lastNameSchema.optional,

  display_name:  z.string().max(100).optional,

  phone: phoneSchema.optional,

  position: z.string().max(50).optional,

  org_id: IDSchema,
});



export const statusSchema = z.object({
  status: profileStatusSchema,
});

export const updateRoleSchema = z.object({
  role: roleSchema
});

export const updateAvatarSchema = z.object({
  avatar_url: avatarSchema
});

export const uuidSchema = z.object({

  id: IDSchema

});




