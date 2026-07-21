import { z } from "zod";
import { GENDERS, PREFERRED_CONTACT_TIMES, PRIORITIES, ROLES, SOURCES, SUFFIXES } from "../types/global";
import { CONTACT_STATUSES } from "../types/contact";
import { LEAD_STATUSES } from "../types/lead";
import { DEAL_STAGES } from "../types/deal";
import { PROFILE_STATUSES } from "../types/profile";
import { CUSTOMER_STATUSES } from "../types/customer";

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

export const preferedTimeSchema = z.enum(PREFERRED_CONTACT_TIMES);

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


export const notesSchema = z
  .string()
  .trim()
  .max(2000);

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