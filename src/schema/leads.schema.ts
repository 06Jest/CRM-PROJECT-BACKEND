import { z } from "zod";
import { 
  birthdateSchema,
  companyNameSchema,
  sourceSchema,
  departmentSchema,
  emailSchema,
  firstNameSchema,
  genderSchema,
  lastNameSchema,
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

  first_name: firstNameSchema,

  last_name: lastNameSchema,

  suffix: suffixSchema.optional().nullable(),

  gender: genderSchema,

  birth_date: birthdateSchema.optional().nullable(),

  email: emailSchema.nullable(),

  phone: phoneSchema.nullable(),
  
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

export const updateLeadSchema = z.object({

  title: titleSchema.optional(),

  source: sourceSchema.optional(),

  first_name: firstNameSchema.optional(),

  last_name: lastNameSchema.optional(),

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



