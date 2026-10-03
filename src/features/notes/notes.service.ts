import {
  archiveNoteFromDB,
  addNoteToDB,
  deleteNoteFromDB,
  deletePrivateNoteFromDB,
  getNoteByIDFromDB,
  getNotesFromDB,
  getPrivateNotesFromDB,
  getPublicNotesFromDB,
  isPinnedNoteFromDB,
  updateNoteFromDB,
} from "./notes.repository";
import { AppError } from "../../middleware/error.middleware";
import { ensureResourceLimit } from "../../services/plans.service";
import { table } from "../../config/tables";
import noteEventsPublisher from "./notes-events.publisher";
import type {
  AddNote,
  UpdateNote,
} from "./notes.types";

export const getPublicNotesService = async (
  orgId: string,
  accessToken: string
) => {
  return getPublicNotesFromDB(
    orgId,
    accessToken
  );
};

export const getNotesService = async (
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  return getNotesFromDB(
    orgId,
    memberId,
    accessToken
  );
};

export const getPrivateNotesService = async (
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  return getPrivateNotesFromDB(
    orgId,
    memberId,
    accessToken
  );
};

export const getNoteByIDService = async (
  id: string,
  orgId: string,
  accessToken: string
) => {
  return getNoteByIDFromDB(
    id,
    orgId,
    accessToken
  );
};

export const addNoteService = async (
  profileId: string,
  orgId: string,
  memberId: string,
  note: AddNote,
  accessToken: string
) => {
  await ensureResourceLimit(
    orgId,
    table.notes,
    "notes",
    "active_limit",
    accessToken
  );

  const data = await addNoteToDB(
    profileId,
    orgId,
    memberId,
    note,
    accessToken
  );

  await noteEventsPublisher.created(
    orgId,
    memberId,
    data.id
  );

  return data;
};

export const updateNoteService = async (
  id: string,
  orgId: string,
  memberId: string,
  note: UpdateNote,
  accessToken: string
) => {
  const existingNote = await getNoteByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (existingNote.author_id !== memberId) {
    throw new AppError(
      401,
      "Only Author can edit this note"
    );
  }

  const data = await updateNoteFromDB(
    id,
    orgId,
    memberId,
    note,
    accessToken
  );

  await noteEventsPublisher.updated(
    orgId,
    memberId,
    id
  );

  return data;
};

export const isPinnedNoteService = async (
  id: string,
  orgId: string,
  memberId: string,
  pinned: boolean,
  accessToken: string
) => {
  const data = await isPinnedNoteFromDB(
    id,
    orgId,
    memberId,
    pinned,
    accessToken
  );

  await noteEventsPublisher.pinned(
    orgId,
    memberId,
    id
  );

  return data;
};

export const deletePrivateNoteService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const existingNote = await getNoteByIDFromDB(
    id,
    orgId,
    accessToken
  );

  if (existingNote.author_id !== memberId) {
    throw new AppError(
      401,
      "Only the author can delete this note"
    );
  }

  const data = await deletePrivateNoteFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await noteEventsPublisher.deleted(
    orgId,
    memberId,
    id
  );

  return data;
};

export const archiveNoteService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await archiveNoteFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await noteEventsPublisher.archived(
    orgId,
    memberId,
    id
  );

  return data;
};

export const deleteNoteService = async (
  id: string,
  orgId: string,
  memberId: string,
  accessToken: string
) => {
  const data = await deleteNoteFromDB(
    id,
    orgId,
    memberId,
    accessToken
  );

  await noteEventsPublisher.deleted(
    orgId,
    memberId,
    id
  );

  return data;
};