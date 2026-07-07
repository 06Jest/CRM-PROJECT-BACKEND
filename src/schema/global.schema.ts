import { z } from "zod";

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

export const IDSchema = z
  .uuid("Invalid ID");

export const phoneSchema = z
  .string()
  .regex(/^09\d{9}$/, "Invalid Philippine mobile number");

export const avatarSchema = z.object({
  avatar_url: z
    .url("Avatar URL must be a valid URL.")
    .nullable,
});
