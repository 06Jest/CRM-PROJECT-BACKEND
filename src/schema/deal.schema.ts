import { z } from 'zod';
import { dealStageSchema, notesSchema, titleSchema, uuidSchema, valueSchema } from './global.schema';

export const addDealSchema = z.object({

  contact_id: uuidSchema,

  title: titleSchema,

  stage: dealStageSchema,

  notes: notesSchema.optional(),

  value: valueSchema

});

export const updateDealSchema = z.object({

  title: titleSchema.optional(),

  notes: notesSchema.optional(),

  value: valueSchema.optional()

});

export const updateDealStageSchema = z.object({

  stage: dealStageSchema

});


export const closeDealSchema = z.object({

  title: titleSchema.optional(),

  stage: dealStageSchema.optional(),

  notes: notesSchema.optional(),

  value: valueSchema.optional()

});