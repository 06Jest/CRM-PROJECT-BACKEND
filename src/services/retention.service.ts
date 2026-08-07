import { supabaseAdmin } from "../config/supabase";
import { table } from "../config/tables";
import { RETENTION_LIMITS } from "../types/retention";
import { getRetentionCutoffDate } from "../utils/retention";


export const cleanupOrganizationRetention = async (
  orgId: string,
  plan: keyof typeof RETENTION_LIMITS
) => {


  const policy = RETENTION_LIMITS[plan];


  if (policy.activities !== null) {

    const cutoff =
      getRetentionCutoffDate(
        policy.activities
      );


    await supabaseAdmin
      .from(table.activities)
      .delete()
      .eq(
        "org_id",
        orgId
      )
      .lt(
        "created_at",
        cutoff
      );
  }



  if (policy.messages !== null) {

    const cutoff =
      getRetentionCutoffDate(
        policy.messages
      );


    await supabaseAdmin
      .from(table.chat.messages)
      .delete()
      .eq(
        "org_id",
        orgId
      )
      .lt(
        "created_at",
        cutoff
      );
  }

};