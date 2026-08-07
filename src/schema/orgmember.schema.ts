import { z } from "zod";
import { orgMemberStatusSchema, roleSchema } from "./global.schema";



export const updateMemberRoleSchema = z.object({

  role: roleSchema,

});



export const updateMemberStatusSchema = z.object({

  status: orgMemberStatusSchema,

});