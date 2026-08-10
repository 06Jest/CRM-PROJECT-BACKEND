import { z } from "zod";

import {
  avatarSchema,
  NameSchema,
  positionSchema,
  profileStatusSchema,
} from "./global.schema";


export const completeProfileSchema = z.object({

  first_name: NameSchema,

  last_name: NameSchema,

  avatar_url: avatarSchema.optional().nullable(),

  job_title: positionSchema.optional().nullable(),
});


export const updateProfileSchema = z.object({

  first_name: NameSchema
    .optional(),

  last_name: NameSchema
    .optional(),

  display_name: NameSchema.optional(),

  job_title: positionSchema.optional().nullable(),

});


export const updateProfileAvatarSchema = z.object({

 avatar_url: avatarSchema.optional().nullable(),

});

export const updateProfileStatusSchema = z.object({

 status: profileStatusSchema,

});