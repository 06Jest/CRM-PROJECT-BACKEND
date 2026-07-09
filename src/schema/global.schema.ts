import { z } from "zod";

export const sourceSchema = z.enum([
  "Website",
  "Referral",
  "Facebook",
  "Instagram",
  "LinkedIn",
  "Google Search",
  "Google Ads",
  "Email Campaign",
  "Cold Call",
  "Trade Show",
  "Webinar",
  "Partner",
  "Walk-in",
  "WhatsApp",
  "Messenger",
  "Personal Network",
  "Direct Conversation",
  "Networking Event",
  "Conference",
  "Friend",
  "Family",
  "Other",
]);
export const CONTACT_STATUSES = [
  "Lead",
  "Contacted",
  "Qualified",
  "Opportunity",
  "Customer",
  "Inactive",
  "Lost",
  "Churned",
] as const;

export type ContactStatus = typeof CONTACT_STATUSES[number];

export const contactStatusSchema = z.enum(CONTACT_STATUSES);

export const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Qualified",
  "Closed",
] as const;

export type LeadStatus = typeof LEAD_STATUSES[number];

export const leadStatusSchema = z.enum(LEAD_STATUSES);

export const DEAL_STAGES = [
  "Prospecting",
  "Proposal",
  "Negotiation",
  "Closed Won",
  "Closed Lost",
] as const;

export type DealStage = typeof DEAL_STAGES[number];

export const dealStageSchema = z.enum(DEAL_STAGES);

export const PROFILE_STATUSES = [
  "pending",
  "inactive",
  "active",
  "banned",
  "deleted",
] as const;

export const profileStatusSchema = z.enum([
  "pending",
  "inactive",
  "active",
  "banned",
  "deleted",
]);

export type ProfileStatus = z.infer<typeof profileStatusSchema>;

export const roleSchema = z.enum([
  "super_admin", 
  "admin",
  "agent",
]);

export type Role = z.infer<typeof roleSchema>;

export const genderSchema = z.enum([
  "Male",
  "Female", 
  "Prefer not to say"
]);

export type Gender = z.infer<typeof genderSchema>;

export const prioritySchema = z.enum([
  "Highest",
  "High",
  "Low"
]);

export type Priority = z.infer<typeof prioritySchema>;

export const suffixSchema = z.enum([
  "Jr.",
  "Sr.",
  "II",
  "III",
  "IV",
  "V",
  "VI",
  "VII",
  "VIII",
  "IX",
  "X",
]);

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 12 characters")
  .max(128, "Password must be at most 128 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const emailSchema = z
  .email("Invalid email address");

export const firstNameSchema = z
  .string()
  .min(1, "First name is required")
  .max(50);

export const lastNameSchema = z
  .string()
  .min(1, "Last name is required")
  .max(50);

export const orgNameSchema = z
  .string()
  .min(1, "Organization name is required")
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
  );

export const companyNameSchema = z
  .string()
  .max(100);

export const positionSchema = z
  .string()
  .max(50);

export const departmentSchema = z
  .string()
  .max(50);


export const notesSchema = z
  .string()
  .max(2000);

export const displayNameSchema = z
  .string()
  .max(100);

export const titleSchema = z
  .string()
  .max(150);

export const valueSchema = z
  .number()
  .nonnegative("Deal value cannot be negative.")
  .max(999_999_999.99, "Value is too large.");