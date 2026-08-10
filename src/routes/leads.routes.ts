import { Router } from 'express';
import { authenticateUser,  requireActiveMembership,  verifyToken } from '../middleware/auth.middleware';
import { getLeads, addLead, updateLead, deleteLead, updateLeadStatus, getLeadsLists  } from '../controllers/leads.controller';
import { validateBody } from '../middleware/validate';
import { addLeadSchema, updateLeadSchema, updateLeadStatusSchema } from '../schema/leads.schema';
import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get('/show-leads-lists', readLimiter, getLeadsLists);
router.get('/show-leads', readLimiter,  getLeads);

router.use(requireActiveMembership);

router.post('/add-lead',createLimiter, validateBody(addLeadSchema), addLead);
router.patch('/update-lead/:id',updateLimiter, validateBody(updateLeadSchema), updateLead);
router.patch('/update-lead-status/:id',updateLimiter, validateBody(updateLeadStatusSchema), updateLeadStatus);

router.delete('/delete-lead/:id',deleteLimiter,  deleteLead);

export default router;

 