import { z } from 'zod';
import { dealStageSchema,  longTextSchema,  titleSchema, uuidSchema, valueSchema } from './global.schema';

export const addDealSchema = z.object({

  contact_id: uuidSchema,

  title: titleSchema,

  stage: dealStageSchema,

  notes: longTextSchema.optional(),

  value: valueSchema

});

export const updateDealSchema = z.object({

  title: titleSchema.optional(),

  notes: longTextSchema.optional(),

  value: valueSchema.optional()

});

export const updateDealStageSchema = z.object({

  stage: dealStageSchema

});


export const closeDealSchema = z.object({

  title: titleSchema.optional(),

  stage: dealStageSchema.optional(),

  notes: longTextSchema.optional(),

  value: valueSchema.optional()

});