import { z } from "zod";

export const createFeedbackSchema = z.object({
  name: z
    .string()
    .trim()
    .max(100, "Name must be 100 characters or less")
    .optional()
    .or(z.literal("")),

  email: z
    .string()
    .trim()
    .email("Invalid email address")
    .max(255, "Email is too long")
    .optional()
    .or(z.literal("")),

  rating: z
    .number()
    .int()
    .min(1)
    .max(5)
    .nullable()
    .optional(),

  message: z
    .string()
    .trim()
    .min(1, "Feedback is required")
    .max(1000, "Feedback must be 1000 characters or less"),
});