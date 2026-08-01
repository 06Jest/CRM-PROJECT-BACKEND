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


const tab = table.deals;


const ownerFkey = "deals_owner_id_fkey";
const contactFkey = "deals_contact_id_fkey";


const selectAll = `
  *,
  owner:profiles!${ownerFkey} (
    id,
    first_name,
    last_name
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
};







export const getDealsListsFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DealListItem[]> => {


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
};








export const getDealsByIDFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<DealListItem> => {


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
};








export const addDealToDB = async (
  orgId: string,
  userId: string,
  deal: AddDeal,
  accessToken: string
): Promise<DealListItem> => {


  const db = createSupabaseUserClient(accessToken);



  const { data, error } = await db
    .from(tab)
    .insert({
      ...deal,
      org_id: orgId,
      owner_id: userId,
      updated_by: userId,
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








export const updateDealFromDB = async (
  id: string,
  userId: string,
  deal: UpdateDeal,
  orgId: string,
  accessToken: string
): Promise<DealListItem> => {


  const db = createSupabaseUserClient(accessToken);



  const { data, error } = await db
    .from(tab)
    .update({
      ...deal,
      updated_by:userId,
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
  userId: string,
  stage: DealStage,
  accessToken: string
): Promise<DealListItem> => {


  const db = createSupabaseUserClient(accessToken);



  const { data, error } = await db
    .from(tab)
    .update({
      stage,
      updated_by:userId,
    })
    .eq("id", id)
    .eq("org_id", orgId)
    .select(selectAll)
    .single();



  if (error) {
    throw new AppError(
      500,
      `Failed to update deal stage: ${error.message}`
    );
  }


  return data as DealListItem;
};








export const closeDealFromDB = async (
  id: string,
  outcome: "Closed Won" | "Closed Lost",
  userId: string,
  orgId: string,
  accessToken: string
): Promise<DealListItem> => {


  const db = createSupabaseUserClient(accessToken);



  const { data, error } = await db
    .from(tab)
    .update({
      stage: outcome,
      updated_by:userId,
      close_date:new Date().toISOString(),
      closed_by:userId,
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








export const deleteDealFromDB = async (
  id: string,
  userId: string,
  orgId:string,
  accessToken:string
): Promise<string> => {


  const db = createSupabaseUserClient(accessToken);



  const { error } = await db
    .from(tab)
    .update({
      deleted_at:new Date().toISOString(),
      deleted_by:userId,
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
  id:string,
  orgId:string,
  userId:string,
  accessToken:string
):Promise<string> => {


  const db = createSupabaseUserClient(accessToken);



  const { error } = await db
    .from(tab)
    .update({
      deleted_at:new Date().toISOString(),
      deleted_by:userId,
    })
    .eq("contact_id",id)
    .eq("org_id",orgId);



  if(error){
    throw new AppError(
      500,
      `Failed to delete deals: ${error.message}`
    );
  }


  return id;
};








export const deleteAllDealsByBulkContactsFromDB = async (
  ids:string[],
  orgId:string,
  userId:string,
  accessToken:string
):Promise<string[]> => {


  const db = createSupabaseUserClient(accessToken);



  const { error } = await db
    .from(tab)
    .update({
      deleted_at:new Date().toISOString(),
      deleted_by:userId,
    })
    .in("contact_id",ids)
    .eq("org_id",orgId);



  if(error){
    throw new AppError(
      500,
      `Failed to delete deals: ${error.message}`
    );
  }


  return ids;
};