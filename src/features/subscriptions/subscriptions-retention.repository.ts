import { supabaseAdmin } from "../../config/supabase";
import { table } from "../../config/tables";

export const cleanupActivitiesRetentionInDB =
  async (
    orgId: string,
    cutoff: string
  ): Promise<void> => {
    await supabaseAdmin
      .from(table.activities)
      .delete()
      .eq("org_id", orgId)
      .lt("created_at", cutoff);
  };

export const cleanupMessagesRetentionInDB =
  async (
    orgId: string,
    cutoff: string
  ): Promise<void> => {
    await supabaseAdmin
      .from(table.chat.messages)
      .delete()
      .eq("org_id", orgId)
      .lt("created_at", cutoff);
  };