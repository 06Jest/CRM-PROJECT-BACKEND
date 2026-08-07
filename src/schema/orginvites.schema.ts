import { z } from "zod";

import {
  emailSchema,
  inviteCodeSchema,
  roleSchema,
} from "./global.schema";

export const createOrganizationInviteSchema = z.object({

  role: roleSchema,

  email: emailSchema
    .optional(),

});

export const acceptOrganizationInviteSchema = z.object({

  code: inviteCodeSchema,

});