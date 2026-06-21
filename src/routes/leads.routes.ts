import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import * as leadController  from '../controllers/leads.controller';

const router = Router();

router.use(authenticateUser);


router.get('/show-leads', leadController.getLeads);
router.post('/add-lead', leadController.addLead);
router.patch('/update-lead', leadController.updateLead);
router.delete('/delete-lead', leadController.deleteLead);

export default router;

 