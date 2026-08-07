import { z } from "zod";

import {
  orgNameSchema,
  workspaceTypeSchema,
  industrySchema,
  businessTypeSchema,
  companySizeSchema,
} from "./global.schema";


export const createWorkspaceSchema = z.object({

  name: orgNameSchema,

  type: workspaceTypeSchema,

  industry: industrySchema
    .nullable()
    .optional(),

  business_type: businessTypeSchema,

  company_size: companySizeSchema,

});


export const renameWorkspaceSchema = z.object({

  name: orgNameSchema,

});