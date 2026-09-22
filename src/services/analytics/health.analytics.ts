import type {
  AnalyticsParams,
  CRMHealthAnalytics,
} from "../../types/analytics";
import { createSupabaseUserClient } from "../../config/supabase";
import { table } from "../../config/tables";

interface HealthRecord {
  owner_id?: string | null;
  assigned_to?: string | null;
  deleted_at?: string | null;
  is_archived?: boolean | null;
  email?: string | null;
  phone?: string | null;
}

const fetchRecords = async (
  supabase: ReturnType<typeof createSupabaseUserClient>,
  tableName: string,
  select: string,
): Promise<HealthRecord[]> => {
  const { data, error } = await supabase
    .from(tableName)
    .select(select);

  if (error) {
    throw new Error(
      `Failed to fetch ${tableName} health analytics: ${error.message}`,
    );
  }

  return (data ?? []) as HealthRecord[];
};

export const getCRMHealthAnalytics = async ({
  accessToken,
}: AnalyticsParams): Promise<CRMHealthAnalytics> => {
  const supabase = createSupabaseUserClient(accessToken);

  const [leads, contacts, customers, deals] = await Promise.all([
    fetchRecords(
      supabase,
      table.leads,
      "owner_id, assigned_to, deleted_at, is_archived, email, phone",
    ),
    fetchRecords(
      supabase,
      table.contacts,
      "owner_id, deleted_at, email, phone",
    ),
    fetchRecords(
      supabase,
      table.customers,
      "owner_id, assigned_to, deleted_at, is_archived",
    ),
    fetchRecords(
      supabase,
      table.deals,
      "owner_id, assigned_to, deleted_at, is_archived",
    ),
  ]);

  const records = [
    ...leads,
    ...contacts,
    ...customers,
    ...deals,
  ];

  let archivedRecords = 0;
  let deletedRecords = 0;
  let recordsMissingOwner = 0;
  let recordsMissingContactInfo = 0;

  for (const record of records) {
    if (record.is_archived) {
      archivedRecords += 1;
    }

    if (record.deleted_at) {
      deletedRecords += 1;
    }

    if (!record.owner_id && !record.assigned_to) {
      recordsMissingOwner += 1;
    }
  }

  for (const record of [...leads, ...contacts]) {
    if (!record.email && !record.phone) {
      recordsMissingContactInfo += 1;
    }
  }

  return {
    available: true,
    totalRecords: records.length,
    archivedRecords,
    deletedRecords,
    recordsMissingOwner,
    recordsMissingContactInfo,
  };
};