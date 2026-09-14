import { z } from "zod";

export const publicAIRequestSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(10000, "Message is too long"),

  conversationId: z
    .string()
    .uuid("Invalid conversation ID")
    .optional(),
});

export type PublicAIRequestInput = z.infer<
  typeof publicAIRequestSchema
>;

export const aiRequestSchema = z.object({
  agentId: z
    .string()
    .min(1, "Agent ID is required"),

  message: z
    .string()
    .min(1, "Message is required")
    .max(10000, "Message is too long"),

  conversationId: z
    .string()
    .uuid("Invalid conversation ID")
    .optional(),
});

export type AIRequestInput = z.infer<typeof aiRequestSchema>;