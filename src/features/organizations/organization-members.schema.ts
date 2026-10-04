import { z } from "zod";
import { orgMemberStatusSchema, roleSchema } from "../../schema/global.schema";



export const updateMemberRoleSchema = z.object({

  role: roleSchema,

});



export const updateMemberStatusSchema = z.object({

  status: orgMemberStatusSchema,

});