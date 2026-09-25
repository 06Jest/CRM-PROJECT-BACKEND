
import { createSupabaseUserClient } from "../config/supabase";
import type {
  AddDeal,
  Deal,
  DealListItem,
  DealStage,
  UpdateDeal,
} from "../types/deal";
import { AppError } from "../middleware/error.middleware";
import { table } from "../config/tables";
import cacheService from "../cache/cache.service";
import {
  dealsRawListCacheKey,
  dealsListCacheKey,
  dealListCacheKey,
  dealCacheKey,
  dealsByContactCacheKey,
} from "../cache/cache-keys";

const tab = table.deals;
const ownerFkey = "deals_owner_id_fkey";
const contactFkey = "deals_contact_id_fkey";


const selectAll = `
  *, 
  owner:organization_members!${ownerFkey} (
    id, 
    profile:profiles(
      first_name, 
      last_name, 
      avatar_url 
    )
  ), 
  assigned:organization_members!deals_assigned_to_fkey (
    id, 
    profile:profiles(
      first_name, 
      last_name, 
      avatar_url 
    )
  ), 
  contact:contacts!${contactFkey} (
    id, 
    first_name, 
    last_name, 
    email, 
    phone 
  ) 
`;

export const getDealsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<Deal[]> => {
  const cacheKey = dealsRawListCacheKey(orgId);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const db = createSupabaseUserClient(accessToken);

      const { data, error } = await db
        .from(tab)
        .select("*")
        .eq("org_id", orgId)
        .is("deleted_at", null);

      if (error) {
        throw new AppError(
          500,
          `Failed to fetch deals: ${error.message}`
        );
      }

      return data ?? [];
    },
    60
  );
};

export const getDealsListsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DealListItem[]> => {
  const cacheKey = dealsListCacheKey(orgId);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const db = createSupabaseUserClient(accessToken);

      const { data, error } = await db
        .from(tab)
        .select(selectAll)
        .eq("org_id", orgId)
        .is("deleted_at", null);

      if (error) {
        throw new AppError(
          500,
          `Failed to fetch deals: ${error.message}`
        );
      }

      return (data ?? []) as DealListItem[];
    },
    60
  );
};

export const getDealListByIDFromDB = async (
  dealId: string,
  orgId: string,
  accessToken: string
): Promise<DealListItem> => {
  const cacheKey = dealListCacheKey(orgId, dealId);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const db = createSupabaseUserClient(accessToken);

      const { data, error } = await db
        .from(tab)
        .select(selectAll)
        .eq("org_id", orgId)
        .eq("id", dealId)
        .is("deleted_at", null)
        .single();

      if (error) {
        throw new AppError(
          500,
          `Failed to fetch deals: ${error.message}`
        );
      }

      return data as DealListItem;
    },
    60
  );
};

export const getDealsListsByContactIDFromDB = async (
  contactId: string,
  orgId: string,
  accessToken: string
): Promise<DealListItem[]> => {
  const cacheKey = dealsByContactCacheKey(orgId, contactId);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const db = createSupabaseUserClient(accessToken);

      const { data, error } = await db
        .from(tab)
        .select(selectAll)
        .eq("org_id", orgId)
        .eq("contact_id", contactId)
        .is("deleted_at", null);

      if (error) {
        throw new AppError(
          500,
          `Failed to fetch deals: ${error.message}`
        );
      }

      return (data ?? []) as DealListItem[];
    },
    60
  );
};

export const getDealsByIDFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<DealListItem> => {
  const cacheKey = dealCacheKey(orgId, id);

  return cacheService.getOrSet(
    cacheKey,
    async () => {
      const db = createSupabaseUserClient(accessToken);

      const { data, error } = await db
        .from(tab)
        .select(selectAll)
        .eq("id", id)
        .eq("org_id", orgId)
        .is("deleted_at", null)
        .single();

      if (error) {
        throw new AppError(
          500,
          `Failed to fetch deal: ${error.message}`
        );
      }

      return data as DealListItem;
    },
    60
  );
};

export const addDealToDB = async (
  orgId: string,
  memberId: string,
  deal: AddDeal,
  accessToken: string
): Promise<DealListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert({
      ...deal,
      org_id: orgId,
      owner_id: memberId,
      updated_by: memberId,
    })
    .select(selectAll)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to add deal: ${error.message}`
    );
  }

  

  return data as DealListItem;
};

export const getOpenDealsByContactIDFromDB = async (
  contactId: string,
  orgId: string,
  accessToken: string
) => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from("deals")
    .select("*")
    .eq("contact_id", contactId)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .not("stage", "in", '("Closed Won","Closed Lost")');

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch open deals: ${error.message}`
    );
  }

  return data ?? [];
};

export const updateDealFromDB = async (
  id: string,
  memberId: string,
  deal: UpdateDeal,
  orgId: string,
  accessToken: string
): Promise<DealListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      ...deal,
      updated_by: memberId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .select(selectAll)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update deal: ${error.message}`
    );
  }

  

  return data as DealListItem;
};

export const updateDealStageFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  stage: DealStage,
  accessToken: string
): Promise<DealListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db.rpc("update_deal_stage", {
    p_deal_id: id,
    p_org_id: orgId,
    p_member_id: memberId,
    p_stage: stage,
  });

  if (error) {
    throw new AppError(
      500,
      `Failed to update deal stage: ${error.message}`
    );
  }

  

  return getDealsByIDFromDB(id, orgId, accessToken);
};

export const closeDealFromDB = async (
  id: string,
  outcome: "Closed Won" | "Closed Lost",
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<DealListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      stage: outcome,
      updated_by: memberId,
      close_date: new Date().toISOString(),
      closed_by: memberId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .select(selectAll)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to close deal: ${error.message}`
    );
  }

  

  return data as DealListItem;
};

export const archiveDealFromDB = async (
  id: string,
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<string> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      is_archived: true,
      archived_at: new Date().toISOString(),
      archived_by: memberId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .eq("is_archived", false);

  if (error) {
    throw new AppError(
      500,
      `Failed to archive deal: ${error.message}`
    );
  }

  

  return id;
};

export const deleteDealFromDB = async (
  id: string,
  memberId: string,
  orgId: string,
  accessToken: string
): Promise<string> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: memberId,
    })
    .eq("id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete deal: ${error.message}`
    );
  }

  

  return id;
};

export const deleteAllDealsByContactIDFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: memberId,
    })
    .eq("contact_id", id)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete deals: ${error.message}`
    );
  }

  

  return id;
};

export const deleteAllDealsByBulkContactsFromDB = async (
  ids: string[],
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<string[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { error } = await db
    .from(tab)
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: memberId,
    })
    .in("contact_id", ids)
    .eq("org_id", orgId);

  if (error) {
    throw new AppError(
      500,
      `Failed to delete deals: ${error.message}`
    );
  }

  

  return ids;
};
