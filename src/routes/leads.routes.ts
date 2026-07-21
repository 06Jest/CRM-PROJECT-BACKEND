import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';
import { getLeads, addLead, updateLead, deleteLead, updateLeadStatus, getLeadsLists  } from '../controllers/leads.controller';
import { validateBody } from '../middleware/validate';
import { addLeadSchema, updateLeadSchema, updateLeadStatusSchema } from '../schema/leads.schema';

const router = Router();

router.use(verifyToken);
router.use(authenticateUser);

router.get('/show-leads-lists', getLeadsLists);
router.get('/show-leads',  getLeads);


router.post('/add-lead', validateBody(addLeadSchema), addLead);
router.patch('/update-lead/:id', validateBody(updateLeadSchema), updateLead);
router.patch('/update-lead-status/:id', validateBody(updateLeadStatusSchema), updateLeadStatus);

router.delete('/delete-lead/:id', deleteLead);

export default router;

 