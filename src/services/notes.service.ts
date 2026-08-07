import { createSupabaseUserClient } from '../config/supabase';
import { AppError } from '../middleware/error.middleware';
import { table } from '../config/tables';

import type {
  NoteListItem,
  AddNote,
  UpdateNote,
} from '../types/note';

const tab = table.notes;
const fkey = 'notes_author_id_fkey';

const selectAllWithAuthor = `
  *,
  author:organization_members!${fkey} (
    id,
    profile:profiles(
      first_name,
      last_name,
      avatar_url
    )
  )
`;

const all = selectAllWithAuthor;

export const getPublicNotesFromDB = async (
  orgId: string,
  accessToken: string
): Promise<NoteListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq('org_id', orgId)
    .eq('visibility', 'public')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch Notes: ${error.message}`);
  }

  return data ?? [];
};

export const getPrivateNotesFromDB = async (
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<NoteListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq('org_id', orgId)
    .eq('author_id', memberId)
    .eq('visibility', 'private')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch Notes: ${error.message}`);
  }

  return data ?? [];
};

export const getNotesFromDB = async (
  orgId: string,
  memberId: string,
  accessToken: string
): Promise<NoteListItem[]> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq("org_id", orgId)
    .is("deleted_at", null)
    .or(
      `visibility.eq.public,and(visibility.eq.private,author_id.eq.${memberId})`
    )
    .order("created_at", { ascending: false });

  if (error) {
    throw new AppError(500, `Failed to fetch Notes: ${error.message}`);
  }

  return data ?? [];
};

export const getNoteByIDFromDB = async (
  id: string,
  orgId: string,
  accessToken: string
): Promise<NoteListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .select(all)
    .eq('id', id)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .single();

  if (error) {
    throw new AppError(500, `Failed to fetch Note: ${error.message}`);
  }

  return data;
};

export const addNoteToDB = async (
  orgId: string,
  memberId: string,
  note: AddNote,
  accessToken: string
): Promise<NoteListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .insert({
      ...note,
      org_id: orgId,
      author_id: memberId,
      updated_by: memberId,
    })
    .select(all)
    .single();

  if (error) {
    throw new AppError(500, `Failed to add Note: ${error.message}`);
  }

  return data;
};

export const updateNoteFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  note: UpdateNote,
  accessToken: string
): Promise<NoteListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      ...note,
      updated_by: memberId,
    })
    .eq('id', id)
    .eq('org_id', orgId)
    .eq('author_id', memberId)
    .is('deleted_at', null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(500, `Failed to update Note: ${error.message}`);
  }

  return data;
};

export const isPinnedNoteFromDB = async (
  id: string,
  orgId: string,
  memberId: string,
  pinned: boolean,
  accessToken: string
): Promise<NoteListItem> => {
  const db = createSupabaseUserClient(accessToken);

  const { data, error } = await db
    .from(tab)
    .update({
      pinned,
      updated_by: memberId,
    })
    .eq('id', id)
    .eq('org_id', orgId)
    .is('deleted_at', null)
    .select(all)
    .single();

  if (error) {
    throw new AppError(500, `Failed to update Note: ${error.message}`);
  }

  return data;
};

export const deletePrivateNoteFromDB = async (
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
    .eq('id', id)
    .eq('org_id', orgId)
    .eq('author_id', memberId);

  if (error) {
    throw new AppError(500, `Failed to delete Note: ${error.message}`);
  }

  return id;
};

export const deleteNoteFromDB = async (
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
    .eq('id', id)
    .eq('org_id', orgId);

  if (error) {
    throw new AppError(500, `Failed to delete Note: ${error.message}`);
  }

  return id;
};