import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import * as contactController  from '../controllers/contacts.controller';

const router = Router();

router.use(authenticateUser);

router.get('/show-contacts', contactController.getContacts);
router.post('/add-contact', contactController.addContact);
router.post('/add-leadscontact', contactController.addContactFromLeads);
router.patch('/update-contact', contactController.updateContact);
router.delete('/delete-contact', contactController.deleteContact);

export default router;

 