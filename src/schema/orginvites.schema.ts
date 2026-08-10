import { z } from "zod";

import {
  emailSchema,
  inviteCodeSchema,
  inviteExpiresAtSchema,
  inviteMaxUsesSchema,
  roleSchema,
} from "./global.schema";

export const createOrganizationInviteSchema = z.object({

  role: roleSchema,

  email: emailSchema
    .optional().nullable(),

  max_uses: inviteMaxUsesSchema,

  expires_at: inviteExpiresAtSchema,

});

export const acceptOrganizationInviteSchema = z.object({

  code: inviteCodeSchema,

});