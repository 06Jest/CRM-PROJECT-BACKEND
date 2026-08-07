import { z } from "zod";

import {
  avatarSchema,
  firstNameSchema,
  lastNameSchema,
  positionSchema,
  profileStatusSchema,
} from "./global.schema";


export const completeProfileSchema = z.object({

  first_name: firstNameSchema,

  last_name: lastNameSchema,

  avatar_url: avatarSchema.optional().nullable(),

  job_title: positionSchema.optional().nullable(),
});


export const updateProfileSchema = z.object({

  first_name: firstNameSchema
    .optional(),

  last_name: lastNameSchema
    .optional(),

  job_title: positionSchema.optional().nullable(),

});


export const updateProfileAvatarSchema = z.object({

 avatar_url: avatarSchema.optional().nullable(),

});

export const updateProfileStatusSchema = z.object({

 status: profileStatusSchema,

});