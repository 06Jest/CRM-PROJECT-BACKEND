import { z } from "zod";
import { GENDERS, PREFERRED_CONTACT_TIMES, PRIORITIES, ROLES, SOURCES, SUFFIXES } from "../types/global";
import { CONTACT_STATUSES } from "../types/contact";
import { LEAD_STATUSES } from "../types/lead";
import { DEAL_STAGES } from "../types/deal";
import { PROFILE_STATUSES } from "../types/profile";
import { CUSTOMER_STATUSES } from "../types/customer";
import { NOTE_TARGET_TYPES, NOTE_VISIBILITIES } from "../types/note";
import { EMAIL_PROVIDERS, EMAIL_STATUSES } from "../types/email";
import { TASK_PRIORITIES, TASK_STATUSES, TASK_TARGET_TYPES, TASK_TYPES, TASK_VISIBILITIES } from "../types/task";
import { CHAT_TARGET_TYPES, CONVERSATION_TYPES } from "../types/chat";
import { CALL_STATUSES, CALL_OUTCOMES, CALL_TYPES } from "../types/calls";

export const sourceSchema = z.enum(SOURCES);

export const contactStatusSchema = z.enum(CONTACT_STATUSES);

export const leadStatusSchema = z.enum(LEAD_STATUSES);

export const CustomerStatusSchema = z.enum(CUSTOMER_STATUSES);

export const dealStageSchema = z.enum(DEAL_STAGES);

export const profileStatusSchema = z.enum(PROFILE_STATUSES);

export const roleSchema = z.enum(ROLES);

export const genderSchema = z.enum(GENDERS);

export const prioritySchema = z.enum(PRIORITIES);

export const suffixSchema = z.enum(SUFFIXES);

export const noteVisibilitySchema = z.enum(NOTE_VISIBILITIES);

export const noteTargetTypeSchema = z.enum(NOTE_TARGET_TYPES);

export const preferedTimeSchema = z.enum(PREFERRED_CONTACT_TIMES);

export const emailStatusSchema = z.enum(EMAIL_STATUSES);

export const taskStatusSchema = z.enum(TASK_STATUSES);

export const taskPrioritySchema = z.enum(TASK_PRIORITIES);

export const taskTargetTypeSchema = z.enum(TASK_TARGET_TYPES);

export const emailProviderSchema = z.enum(EMAIL_PROVIDERS);

export const taskVisibilitySchema = z.enum(TASK_VISIBILITIES);

export const taskTypesSchema = z.enum(TASK_TYPES);

export const conversationTypeSchema = z.enum(CONVERSATION_TYPES);

export const chatTargetTypeSchema = z.enum(CHAT_TARGET_TYPES);

export const callStatusSchema = z.enum(CALL_STATUSES);

export const callOutcomeSchema = z.enum(CALL_OUTCOMES);

export const callTypesSchema = z.enum(CALL_TYPES);



export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 12 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const emailSchema = z
  .email("Invalid email address")
  .trim();

export const firstNameSchema = z
  .string()
  .trim()
  .min(2, "Please provide a valid First Name.")
  .max(50)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const lastNameSchema = z
  .string()
  .trim()
  .min(2, "Please provide a valid Last Name.")
  .max(50)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const orgNameSchema = z
  .string()
  .trim()
  .min(3, "Please provide a valid Organization Name.")
  .max(100)
  

export const uuidSchema = z
  .uuid("Invalid ID");

export const phoneSchema = z
  .string()
  .regex(/^09\d{9}$/, "Invalid Philippine mobile number");

export const avatarSchema = z
  .url("Avatar URL must be a valid URL.");

export const birthdateSchema = z
  .iso
  .date()
  .refine(
    (date) => new Date(date) <= new Date(),
    {
      message: "Birthdate cannot be in the future.",
    }
  ).nullable();

export const companyNameSchema = z
  .string()
  .trim()
  .max(100);

export const industrySchema = z
  .string()
  .trim()
  .max(100);

export const positionSchema = z
  .string()
  .trim()
  .max(50)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const departmentSchema = z
  .string()
  .trim()
  .max(50)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const websiteSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" ||
      /^https?:\/\/.+/i.test(value),
    {
      message: "Website must start with http:// or https://",
    }
  );


export const longTextSchema = z
  .string()
  .trim()
  .min(1, "Text cannot be empty.")
  .max(5000, "Text cannot exceed 5000 characters.");

export const displayNameSchema = z
  .string()
  .trim()
  .max(100);

export const titleSchema = z
  .string()
  .trim()
  .max(150)
  .refine(
    (value) => !/(.)\1{3,}/.test(value),
    "A character cannot be repeated 4 or more times consecutively."
  );

export const valueSchema = z
  .number()
  .nonnegative("Deal value cannot be negative.")
  .max(999_999_999.99, "Value is too large.");

export const socialUsernameSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || /^[A-Za-z0-9._-]{2,100}$/.test(value),
    {
      message: "Invalid username.",
    }
  ).transform((value) => (value === "" ? null : value));;

 export const messagingNumberSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      value === "" || /^\+?[0-9]{7,15}$/.test(value),
    {
      message: "Invalid phone number.",
    }
  ).transform((value) => (value === "" ? null : value));;


  export const emailSubjectSchema = z
  .string()
  .trim()
  .min(1, "Subject is required.")
  .max(200, "Subject is too long.");


export const emailBodySchema = z
  .string()
  .trim()
  .min(1, "Email body cannot be empty.")
  .max(50000, "Email body is too long.");


export const previewTextSchema = z
  .string()
  .trim()
  .max(300);


export const senderNameSchema = z
  .string()
  .trim()
  .max(100);


export const senderEmailSchema = z
  .email("Invalid sender email.")
  .trim();