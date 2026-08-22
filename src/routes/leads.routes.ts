import { Router } from 'express';
import { authenticateUser,  requireActiveMembership,  verifyToken } from '../middleware/auth.middleware';
import { getLeads, addLead, updateLead, deleteLead, updateLeadStatus, getLeadsLists, updateLeadNotes, updateLeadSource, updateLeadPriority, updateLeadPreferedTme  } from '../controllers/leads.controller';
import { validateBody } from '../middleware/validate';
import { addLeadSchema, updateCareerSchema, updateLeadNotesSchema, updateLeadPreferredTimeSchema, updateLeadPrioritySchema, updateLeadSchema, updateLeadSourceSchema, updateLeadStatusSchema, updateSocialsSchema } from '../schema/leads.schema';
import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get('/show-lists', readLimiter, getLeadsLists);
router.get('/show', readLimiter,  getLeads);

router.use(requireActiveMembership);

router.post('/add',createLimiter, validateBody(addLeadSchema), addLead);

router.patch('/update/:id',updateLimiter, validateBody(updateLeadSchema), updateLead);
router.patch('/update/career/:id',updateLimiter, validateBody(updateCareerSchema), updateLead);
router.patch('/update/socials/:id',updateLimiter, validateBody(updateSocialsSchema), updateLead);
router.patch('/update/status/:id',updateLimiter, validateBody(updateLeadStatusSchema), updateLeadStatus);
router.patch('/update/notes/:id',updateLimiter, validateBody(updateLeadNotesSchema), updateLeadNotes);
router.patch('/update/source/:id',updateLimiter, validateBody(updateLeadSourceSchema), updateLeadSource);
router.patch('/update/priority/:id',updateLimiter, validateBody(updateLeadPrioritySchema), updateLeadPriority);
router.patch('/update/preferred-time/:id',updateLimiter, validateBody(updateLeadPreferredTimeSchema), updateLeadPreferedTme);

router.delete('/delete-lead/:id',deleteLimiter,  deleteLead);

export default router;

 