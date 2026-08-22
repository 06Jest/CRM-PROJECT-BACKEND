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

  first_name: NameSchema.optional(),

  last_name: NameSchema.optional(),

  suffix: suffixSchema.nullable(),

  gender: genderSchema.optional(),

  birth_date: birthdateSchema.optional().nullable(),

  email: emailSchema.optional(),

  phone: phoneSchema.optional(),

});


export const updateSocialsSchema = z.object({

  linkedin: socialUsernameSchema.nullable().optional(),

  facebook: socialUsernameSchema.nullable().optional(),

  instagram: socialUsernameSchema.nullable().optional(),

  tiktok: socialUsernameSchema.nullable().optional(),

  x: socialUsernameSchema.nullable().optional(),

  telegram: socialUsernameSchema.nullable().optional(),

  whatsapp: messagingNumberSchema.nullable().optional(),

  viber: messagingNumberSchema.nullable().optional(),
});

export const updateCareerSchema = z.object({

  company_name: companyNameSchema.nullable().optional(),

  industry: industrySchema.nullable().optional(),

  position: positionSchema.nullable().optional(),

  department: departmentSchema.nullable().optional(),

  website: websiteSchema.optional().nullable(),
});

export const updateLeadNotesSchema = z.object({

  notes: longTextSchema,

});
export const updateLeadSourceSchema = z.object({

  source: sourceSchema,

});

export const updateLeadPrioritySchema = z.object({

  priority: prioritySchema,

});

export const updateLeadPreferredTimeSchema = z.object({

  preferred_contact_time: preferedTimeSchema,

});


export const updateLeadStatusSchema = z.object({

  status: leadStatusSchema

});



