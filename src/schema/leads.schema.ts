import { z } from "zod";
import { 
  birthdateSchema,
  companyNameSchema,
  sourceSchema,
  departmentSchema,
  emailSchema,
  NameSchema,
  genderSchema,
  phoneSchema,
  positionSchema,
  suffixSchema,
  prioritySchema,
  titleSchema,
  leadStatusSchema,
  industrySchema,
  preferedTimeSchema,
  socialUsernameSchema,
  messagingNumberSchema,
  websiteSchema,
  longTextSchema,
 } from "./global.schema";



export const addLeadSchema = z.object({

  title: titleSchema,

  source: sourceSchema,

  first_name: NameSchema,

  last_name: NameSchema,

  suffix: suffixSchema.optional().nullable(),

  gender: genderSchema,

  birth_date: birthdateSchema.optional().nullable(),

  email: emailSchema.nullable(),

  phone: phoneSchema.nullable(),
  
  industry: industrySchema.optional().nullable(),

  company_name: companyNameSchema.optional().nullable(),

  position: positionSchema.optional().nullable(),

  department: departmentSchema.optional().nullable(),

  website: websiteSchema.optional().nullable(),

  notes: longTextSchema.optional().nullable(),

  priority: prioritySchema,

  preferred_contact_time: preferedTimeSchema,

  linkedin: socialUsernameSchema.nullable().optional(),

  facebook: socialUsernameSchema.nullable().optional(),

  instagram: socialUsernameSchema.nullable().optional(),

  tiktok: socialUsernameSchema.nullable().optional(),

  x: socialUsernameSchema.nullable().optional(),

  telegram: socialUsernameSchema.nullable().optional(),

  whatsapp: messagingNumberSchema.nullable().optional(),

  viber: messagingNumberSchema.nullable().optional(),
});

export const updateLeadSchema = z.object({

  title: titleSchema.optional(),

  source: sourceSchema.optional(),

  first_name: NameSchema.optional(),

  last_name: NameSchema.optional(),

  suffix: suffixSchema.nullable().optional(),

  gender: genderSchema,

  birth_date: birthdateSchema.nullable().optional(),

  email: emailSchema.nullable(),

  phone: phoneSchema.nullable (),

  industry: industrySchema.optional(),

  company_name: companyNameSchema.optional(),

  position: positionSchema.optional(),

  department: departmentSchema.optional(),

  website: websiteSchema.optional().nullable(),

  notes: longTextSchema.optional(),

  priority: prioritySchema,

  preferred_contact_time: preferedTimeSchema,

  linkedin: socialUsernameSchema.nullable().optional(),

  facebook: socialUsernameSchema.nullable().optional(),

  instagram: socialUsernameSchema.nullable().optional(),

  tiktok: socialUsernameSchema.nullable().optional(),

  x: socialUsernameSchema.nullable().optional(),

  telegram: socialUsernameSchema.nullable().optional(),

  whatsapp: messagingNumberSchema.nullable().optional(),

  viber: messagingNumberSchema.nullable().optional(),
});

export const updateLeadStatusSchema = z.object({

  status: leadStatusSchema

});



