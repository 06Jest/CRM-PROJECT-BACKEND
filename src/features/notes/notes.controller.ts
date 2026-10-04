import {
  Request,
  Response,
  NextFunction,
} from "express";
import { AppError } from "../../middleware/error.middleware";
import { uuidSchema } from "../../schema/global.schema";
import {
  addNoteService,
  archiveNoteService,
  deleteNoteService,
  deletePrivateNoteService,
  getNoteByIDService,
  getNotesService,
  getPrivateNotesService,
  getPublicNotesService,
  isPinnedNoteService,
  updateNoteService,
} from "./notes.service";

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

    const notes = await getPublicNotesService(
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const notes = await getNotesService(
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(401, "Unauthorized");
    }

    const notes = await getPrivateNotesService(
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

    const data = await getNoteByIDService(
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;
    const profileId = req.user?.profile_id;

    const note = req.body;

    if (
      !profileId ||
      !orgId ||
      !memberId ||
      !accessToken
    ) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await addNoteService(
      profileId,
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await updateNoteService(
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await isPinnedNoteService(
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await deletePrivateNoteService(
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

export const archiveNote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = uuidSchema.parse(req.params.id);

    const orgId = req.user?.org_id;
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await archiveNoteService(
      id,
      orgId,
      memberId,
      accessToken
    );

    return res.status(200).json({
      success: true,
      message: "Archive Note successful",
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
    const memberId = req.user?.member_id;
    const accessToken = req.cookies.accessToken;

    if (!orgId || !memberId || !accessToken) {
      throw new AppError(
        401,
        "Unauthorized user"
      );
    }

    const data = await deleteNoteService(
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