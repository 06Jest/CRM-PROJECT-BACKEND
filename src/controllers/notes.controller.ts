import { Request, Response, NextFunction } from "express";
import { AppError } from "../middleware/error.middleware";
import { uuidSchema } from "../schema/global.schema";

import {
  getPublicNotesFromDB,
  getPrivateNotesFromDB,
  getNoteByIDFromDB,
  addNoteToDB,
  updateNoteFromDB,
  deletePrivateNoteFromDB,
  deleteNoteFromDB,
  getNotesFromDB,
  isPinnedNoteFromDB,
} from "../services/notes.service";
import { ensureResourceLimit } from "../services/plans.service";
import { table } from "../config/tables";

export const getPublicNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const notes = await getPublicNotesFromDB(
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Public Notes fetch successful",
      data: notes,
    });

  } catch (err) {
    next(err);
  }
};


export const getNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const notes = await getNotesFromDB(
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Notes fetch successful",
      data: notes,
    });

  } catch (err) {
    next(err);
  }
};


export const getPrivateNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const notes = await getPrivateNotesFromDB(
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Private Notes fetch successful",
      data: notes,
    });

  } catch (err) {
    next(err);
  }
};


export const getNoteByID = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.org_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const data = await getNoteByIDFromDB(
      id,
      orgId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Note fetch successful",
      data,
    });

  } catch (err) {
    next(err);
  }
};


export const addNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    const note = req.body;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    await ensureResourceLimit(
      orgId,
      table.notes,
      "notes",
      "active_limit",
      accessToken
    );

    const data = await addNoteToDB(
      orgId,
      memberId,
      note,
      accessToken
    );

    return res.status(201).json({
      success: true,
      message: "Add Note successful",
      data,
    });

  } catch (err) {
    next(err);
  }
};


export const updateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const note = req.body;

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getNoteByIDFromDB(
      id,
      orgId,
      accessToken
    );

    if (check.author_id !== memberId) {
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

    return res.status(200).json({
      success: true,
      message: "Update Note successful",
      data,
    });

  } catch (err) {
    next(err);
  }
};


export const isPinnedNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const { pinned } = req.body;

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await isPinnedNoteFromDB(
      id,
      orgId,
      memberId,
      pinned,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Update Note successful",
      data,
    });

  } catch (err) {
    next(err);
  }
};


export const deletePrivateNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const checkNote = await getNoteByIDFromDB(
      id,
      orgId,
      accessToken
    );

    if (checkNote.author_id !== memberId) {
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

    return res.status(200).json({
      success: true,
      message: "Delete Private Note successful",
      data,
    });

  } catch (err) {
    next(err);
  }
};


export const deleteNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await deleteNoteFromDB(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Delete Note successful",
      data,
    });

  } catch (err) {
    next(err);
  }
};