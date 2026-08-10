// import { z } from "zod";

// import {
//   orgNameSchema,
//   workspaceTypeSchema,
//   industrySchema,
//   businessTypeSchema,
//   companySizeSchema,
// } from "./global.schema";


// export const createWorkspaceSchema = z.object({

//   name: orgNameSchema,

//   type: workspaceTypeSchema,

//   industry: industrySchema
//     .nullable()
//     .optional(),

//   business_type: businessTypeSchema,

//   company_size: companySizeSchema,

// });


// export const renameWorkspaceSchema = z.object({

//   name: orgNameSchema,

// });

import { z } from "zod";

import {
  orgNameSchema,
  workspaceTypeSchema,
  industrySchema,
  businessTypeSchema,
  companySizeSchema,
  websiteSchema,
  shortTextSchema,
  logoUrlSchema,
  productTypeSchema,
} from "./global.schema";


export const createWorkspaceSchema = z.object({

  name: orgNameSchema,

  type: workspaceTypeSchema,

  industry: industrySchema
    .nullable()
    .optional(),

  company_size: companySizeSchema,

});


export const renameWorkspaceSchema = z.object({

  name: orgNameSchema,

});


export const updateWorkspaceDetailsSchema = z
  .object({
    name: orgNameSchema.optional(),
    industry: industrySchema.nullable().optional(),
    company_size: companySizeSchema.optional().nullable(),
    product_type: productTypeSchema.optional().nullable(),
    website: websiteSchema.optional().nullable(),
    description: shortTextSchema.optional().nullable(),
    logo_url: logoUrlSchema.optional().nullable(),
  })
  .refine(
    (value) => Object.values(value).some((v) => v !== undefined),
    { message: "At least one workspace field must be provided" }
  );