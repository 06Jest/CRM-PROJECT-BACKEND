import { z } from "zod";

import {
  uuidSchema,
  longTextSchema,
  chatTargetTypeSchema,
} from "./global.schema";

export const createDirectConversationSchema = z.object({

  profile_id: uuidSchema,

});


export const sendMessageSchema = z.object({

  content: longTextSchema,

  entity_type: chatTargetTypeSchema.optional().nullable(),

  entity_id:uuidSchema.optional().nullable(),

});


export const updateMessageSchema = z.object({

  content: longTextSchema,

});
