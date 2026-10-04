import { createSupabaseUserClient } from "../../config/supabase";
import { AppError } from "../../middleware/error.middleware";

export const getResourceCountFromDB = async (
  tableName: string,
  orgId: string,
  accessToken: string,
  archived = false
): Promise<number> => {
  const db = createSupabaseUserClient(accessToken);

  let query = db
    .from(tableName)
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("org_id", orgId);

  query = archived
    ? query.not("deleted_at", "is", null)
    : query.is("deleted_at", null);

  const { count, error } = await query;

  if (error) {
    throw new AppError(
      500,
      `Failed to count resources in ${tableName}: ${error.message}`
    );
  }

  return count ?? 0;
};