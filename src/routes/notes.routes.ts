import { Router } from 'express';

import { authenticateUser, requireActiveMembership, verifyToken } from '../middleware/auth.middleware';

import { validateBody } from '../middleware/validate';

import {
  addNote,
  getPublicNotes,
  getPrivateNotes,
  getNoteByID,
  updateNote,
  deletePrivateNote,
  deleteNote,
  getNotes,
  isPinnedNote,
  archiveNote
} from '../controllers/notes.controller';

import {
  addNoteSchema,
  pinNoteSchema,
  updateNoteSchema
} from '../schema/note.schema';

import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';
import { idempotencyMiddleware } from '../idempotency/idempotency.middleware';


const router = Router();

router.use(verifyToken);

router.use(authenticateUser);


router.get(
  '/show-notes',
  readLimiter,
  getNotes
);

router.get(
  '/show-public-notes',
  readLimiter,
  getPublicNotes
);

router.get(
  '/show-private-notes',
  readLimiter,
  getPrivateNotes
);

router.post(
  "/add-note",
  createLimiter,
  validateBody(addNoteSchema),
  idempotencyMiddleware,
  addNote
);


router.use(requireActiveMembership);

router.post(
  '/add-note',
  createLimiter,
  validateBody(addNoteSchema),
  addNote
);

router.patch(
  '/update-note/:id',
  updateLimiter,
  validateBody(updateNoteSchema),
  updateNote
);

router.patch(
  '/pin-note/:id',
  updateLimiter,
  validateBody(pinNoteSchema),
  isPinnedNote
);

router.delete(
  '/delete-private-note/:id',
  deleteLimiter,
  deletePrivateNote
);

router.delete(
  '/delete-note/:id',
  deleteLimiter,
  deleteNote
);

router.patch(
  '/archive/:id',
  updateLimiter,
  archiveNote
);


export default router;