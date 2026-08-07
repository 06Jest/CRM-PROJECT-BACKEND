import { z } from "zod";
import {
  passwordSchema,
  emailSchema,
} from "./global.schema";

export const signUpSchema = z.object({
  email: emailSchema,

  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,

  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  current_password: passwordSchema,

  new_password: passwordSchema,
});