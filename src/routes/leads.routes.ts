import { Router } from 'express';
import { authenticateUser,  requireActiveMembership,  verifyToken } from '../middleware/auth.middleware';
import { getLeads, addLead, deleteLead, updateLeadStatus, getLeadsLists, updateLeadNotes, updateLeadSource, updateLeadPriority, updateLeadPersonal, updateLeadCareer, updateLeadSocials, updateLeadPreferredTime, getLeadListByID  } from '../controllers/leads.controller';
import { validateBody } from '../middleware/validate';
import { addLeadSchema, updateCareerSchema, updateLeadNotesSchema, updateLeadPreferredTimeSchema, updateLeadPrioritySchema, updateLeadSchema, updateLeadSourceSchema, updateLeadStatusSchema, updateSocialsSchema } from '../schema/leads.schema';
import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get(
  '/show', 
  readLimiter,  
  getLeads
);

router.get(
  '/show-lists', 
  readLimiter, 
  getLeadsLists
);

router.get(
  '/view-list/:id', 
  readLimiter, 
  getLeadListByID
);


router.use(requireActiveMembership);

router.post(
  '/add',
  createLimiter, 
  validateBody(addLeadSchema), 
  addLead
);

router.patch(
  '/update/personal/:id',
  updateLimiter, 
  validateBody(updateLeadSchema), 
  updateLeadPersonal
);

router.patch(
  '/update/career/:id',
  updateLimiter, 
  validateBody(updateCareerSchema), 
  updateLeadCareer
);

router.patch(
  '/update/socials/:id',
  updateLimiter, 
  validateBody(updateSocialsSchema), 
  updateLeadSocials
);

router.patch(
  '/update/status/:id',
  updateLimiter, 
  validateBody(updateLeadStatusSchema), 
  updateLeadStatus
);

router.patch(
  '/update/notes/:id',
  updateLimiter, 
  validateBody(updateLeadNotesSchema), 
  updateLeadNotes
);

router.patch(
  '/update/source/:id',
  updateLimiter, 
  validateBody(updateLeadSourceSchema), 
  updateLeadSource
);

router.patch(
  '/update/priority/:id',
  updateLimiter, 
  validateBody(updateLeadPrioritySchema), 
  updateLeadPriority
);

router.patch(
  '/update/preferred-time/:id',
  updateLimiter, 
  validateBody(updateLeadPreferredTimeSchema), 
  updateLeadPreferredTime
);


router.delete(
  '/delete/:id',
  deleteLimiter,  
  deleteLead
);

export default router;

 