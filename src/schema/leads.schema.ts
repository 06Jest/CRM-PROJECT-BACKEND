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
  notesSchema,
  phoneSchema,
  positionSchema,
  suffixSchema,
  contactStatusSchema,
  prioritySchema,
  uuidSchema,
  titleSchema,
 } from "./global.schema";



export const addLeadSchema = z.object({

  title: titleSchema,

  source: sourceSchema,

  first_name: firstNameSchema,

  last_name: lastNameSchema,

  suffix: suffixSchema.optional,

  gender: genderSchema.optional,

  birth_date: birthdateSchema.optional,

  email: emailSchema.optional,

  phone: phoneSchema.optional,

  company_name: companyNameSchema.optional,

  position: positionSchema.optional,

  department: departmentSchema.optional,

  notes: notesSchema.optional,

  status: contactStatusSchema,

  priority: prioritySchema,
});

export const updateLeadSchema = z.object({

  title: titleSchema.optional,

  source: sourceSchema.optional,

  first_name: firstNameSchema.optional,

  last_name: lastNameSchema.optional,

  suffix: suffixSchema.optional,

  gender: genderSchema.optional,

  birth_date: birthdateSchema.optional,

  email: emailSchema.optional,

  phone: phoneSchema.optional,

  company_name: companyNameSchema.optional,

  position: positionSchema.optional,

  department: departmentSchema.optional,

  notes: notesSchema.optional,

  status: contactStatusSchema.optional,

  priority: prioritySchema.optional,
});



