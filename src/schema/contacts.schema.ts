import { z } from "zod";
import { 
  birthdateSchema,
  companyNameSchema,
  sourceSchema,
  departmentSchema,
  displayNameSchema,
  emailSchema,
  firstNameSchema,
  genderSchema,
  lastNameSchema,
  phoneSchema,
  positionSchema,
  suffixSchema,
  contactStatusSchema,
  prioritySchema,
  uuidSchema,
  socialUsernameSchema,
  messagingNumberSchema,
  industrySchema,
  preferedTimeSchema,
  websiteSchema,
  longTextSchema,
 } from "./global.schema";


export const addContactSchema = z.object({

  lead_id: uuidSchema.optional(),

  first_name: firstNameSchema,

  last_name: lastNameSchema,

  suffix: suffixSchema.nullable().optional(),

  gender: genderSchema.optional().nullable(),

  birth_date: birthdateSchema.nullable(),

  email: emailSchema.optional(),

  phone: phoneSchema.optional(),

  source: sourceSchema.optional(),

  industry: industrySchema.optional(),

  company_name: companyNameSchema.optional(),

  position: positionSchema.optional(),

  department: departmentSchema.optional(),

  website: websiteSchema.optional(),

  notes: longTextSchema.optional(),

  status: contactStatusSchema,

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
}).refine(
    (data) => !!data.email || !!data.phone,
    {
      message: "Either an email or phone number is required.",
      path: ["email"],
    }
  );

export const updateContactSchema = z.object({

  first_name: firstNameSchema.optional(),

  last_name: lastNameSchema.optional(),

  suffix: suffixSchema.nullable(),

  gender: genderSchema.optional(),

  birth_date: birthdateSchema.optional().nullable(),

  email: emailSchema.optional(),

  phone: phoneSchema.optional(),

  source: sourceSchema.optional(),

  display_name:  displayNameSchema.optional(),

  notes: longTextSchema.optional(),

  status: contactStatusSchema,

  priority: prioritySchema,

  preferred_contact_time: preferedTimeSchema,
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


