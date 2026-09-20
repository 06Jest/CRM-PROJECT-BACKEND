import { Router } from 'express';

import {
  authenticateUser,
  requireActiveMembership,
  verifyToken,
} from '../middleware/auth.middleware';

import {
  getArchives,
  restoreRecord
} from '../controllers/archive.controller';

import { readLimiter } from '../middleware/rate.limit.middleware';


const router = Router();

router.use(verifyToken);

router.use(authenticateUser);

router.use(requireActiveMembership);


router.get(
  '/',
  readLimiter,
  getArchives
);

router.patch(
  '/:entity/:id/restore',
  readLimiter,
  restoreRecord
);


export default router;