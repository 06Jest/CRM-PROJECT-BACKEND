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
  isPineedNoteFromDB,
} from "../services/notes.service";

export const getPublicNotes = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(400, "orgId is required");
    }

    const notes = await getPublicNotesFromDB(orgId);

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
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(400, "orgId is required");
    }

    const notes = await getNotesFromDB(orgId, userId);

    return res.status(200).json({
      success: true,
      message: "Public Notes fetch successful",
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
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const notes = await getPrivateNotesFromDB(orgId, userId);

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
    const orgId = req.user?.orgId;

    if (!orgId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await getNoteByIDFromDB(id, orgId);

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
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;
    const note = req.body;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await addNoteToDB(orgId, userId, note);

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
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const check = await getNoteByIDFromDB(id, orgId);

    if (check.author_id !== userId) throw new AppError(401, "Only Author can edit this note");

    const data = await updateNoteFromDB(id, orgId, userId, note);

    return res.status(200).json({
      success: true,
      message: "Update Note successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};


  export const isPineedNote = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const id = uuidSchema.parse(req.params.id);
      const { pinned } = req.body;
      const orgId = req.user?.orgId;
      const userId = req.user?.sub;

      if (!orgId || !userId) {
        throw new AppError(401, "Unauthorized user");
      }

      const data = await isPineedNoteFromDB(id, orgId, userId, pinned);

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
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const checkNote = await getNoteByIDFromDB(id, orgId);
    
    if (checkNote.author_id !== userId) {
      throw new AppError(401, "Only the author can delete this note");
    }

    const data = await deletePrivateNoteFromDB(id, orgId, userId);

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
    const orgId = req.user?.orgId;
    const userId = req.user?.sub;

    if (!orgId || !userId) {
      throw new AppError(401, "Unauthorized user");
    }

    const data = await deleteNoteFromDB(id, orgId, userId);

    return res.status(200).json({
      success: true,
      message: "Delete Note successful",
      data,
    });
  } catch (err) {
    next(err);
  }
};