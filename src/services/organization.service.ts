import { createSupabaseUserClient, supabaseAdmin } from "../config/supabase";
import {
  Organization,
  CreateWorkspaceDTO,
  DisplayOrganization,
  UpdateWorkspaceDetailsDTO,
} from "../types/organization";
import { AppError } from "../middleware/error.middleware";
import { table } from "../config/tables";
import { generateSlug } from "../utils/slug";
import { Subscription } from "@supabase/supabase-js";

const tab = table.org;
const selectAllWithProfile = `
  id,
  name,
  display_id,
  type,
  industry,
  company_size,
  website,
  logo_url,
  product_type,
  description,
  created_at,
  subscription:subscriptions!subscriptions_org_id_fkey(
    id,
    plan,
    org_id,
    status,
    payment_provider,
    provider_reference,
    billing_cycle,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
  )
`;

const all = selectAllWithProfile;


export const getWorkspaceDataFromDB = async (
  orgId: string,
  accessToken: string
): Promise<DisplayOrganization> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq("id", orgId)
    .single();
    

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch workspace: ${error.message}`
    );
  }

  return data;
};

export const getWorkspaceName = async (
  orgId: string,
  accessToken: string
): Promise<string> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select('name')
    .eq("id", orgId)
    .single();
    

  if (error) {
    throw new AppError(
      500,
      `Failed to fetch workspace: ${error.message}`
    );
  }

  return data.name;
};

export const createWorkspaceInDB = async (
  dto: CreateWorkspaceDTO,
): Promise<Organization> => {

  const db = supabaseAdmin;

  const { data, error } = await db
    .from(tab)
    .insert({
      name: dto.name,
      slug: generateSlug(dto.name),
      type: dto.type,
      industry: dto.industry ?? null,
      product_type: dto.product_type ?? null,
      company_size: dto.company_size ?? null,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to create workspace: ${error.message}`
    );
  }
  return data;
};

export const renameWorkspaceInDB = async (
  orgId: string,
  name: string,
  accessToken: string
): Promise<Organization> => {
  const db = createSupabaseUserClient(accessToken);
    const { data, error } = await db
      .from(tab)
      .update({
        name,
        slug: generateSlug(name),
      })
      .eq("id",orgId)
      .select() 
      .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to rename workspace: ${error.message}`
    );
  }
  return data;
};

export const updateWorkspaceDetailsInDB = async (
  orgId: string,
  updates: UpdateWorkspaceDetailsDTO,
  accessToken: string
): Promise<DisplayOrganization> => {
  const db = createSupabaseUserClient(accessToken);

  const payload: Record<string, unknown> = { ...updates };

  if (typeof updates.name === "string" && updates.name.trim()) {
    payload.slug = generateSlug(updates.name);
  }

  const { data, error } = await db
    .from(tab)
    .update(payload)
    .eq("id", orgId)
    .select(all)
    .single();

  if (error) {
    throw new AppError(
      500,
      `Failed to update workspace: ${error.message}`
    );
  }

  return data;
};