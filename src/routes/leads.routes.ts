import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { getLeads, addLead, updateLead, deleteLead  } from '../controllers/leads.controller';
import { validateBody } from '../middleware/validate';
import { addLeadSchema, updateLeadSchema } from '../schema/leads.schema';

const router = Router();

router.use(authenticateUser);


router.get('/show-leads',  getLeads);
router.post('/add-lead', validateBody(addLeadSchema), addLead);
router.patch('/update-lead/:id', validateBody(updateLeadSchema), updateLead);
router.delete('/delete-lead/:id', deleteLead);

export default router;

 