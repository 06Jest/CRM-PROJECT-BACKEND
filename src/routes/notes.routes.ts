import { Router } from "express";

import {
  authenticateUser,
  verifyToken,
} from "../middleware/auth.middleware";

import { validateBody } from "../middleware/validate";

import {
  addNote,
  getPublicNotes,
  getPrivateNotes,
  getNoteByID,
  updateNote,
  deletePrivateNote,
  deleteNote,
  getNotes,
  isPineedNote,
} from "../controllers/notes.controller";

import {
  addNoteSchema,
  pinNoteSchema,
  updateNoteSchema,
} from "../schema/note.schema";
import { boolean } from "zod";

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get("/show-notes", getNotes);
router.get("/show-public-notes", getPublicNotes);
router.get("/show-private-notes", getPrivateNotes);

router.get("/show-note/:id", getNoteByID);

router.post("/add-note", validateBody(addNoteSchema), addNote);

router.patch("/update-note/:id", validateBody(updateNoteSchema), updateNote);

router.patch("/pin-note/:id", validateBody(pinNoteSchema) , isPineedNote);

router.delete("/delete-private-note/:id",deletePrivateNote);
router.delete("/delete-note/:id",deleteNote);

export default router;