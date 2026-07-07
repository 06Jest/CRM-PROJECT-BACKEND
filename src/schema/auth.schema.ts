import { z } from "zod";
import { 
  passwordSchema,
  emailSchema,
  firstNameSchema,
  lastNameSchema,
  orgNameSchema,
 } from "./global.schema";

export const signUpSchema = z.object({

  email: emailSchema,

  password: passwordSchema,
    
  first_name: firstNameSchema,

  last_name: lastNameSchema,

  org_name: orgNameSchema,
});

export const signInSchema = z.object({

  email: emailSchema,

  password: passwordSchema,
});

export const changePasswordSchema = z.object({

  current_password: passwordSchema,
  
  new_password: passwordSchema,
})


