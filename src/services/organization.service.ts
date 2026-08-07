import { createSupabaseUserClient, supabaseAdmin } from "../config/supabase";
import {
  Organization,
  CreateWorkspaceDTO
} from "../types/organization";
import { AppError } from "../middleware/error.middleware";
import { table } from "../config/tables";
import { generateSlug } from "../utils/slug";

const tab = table.org;

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

