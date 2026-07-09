import { Router } from 'express';
import { authenticateUser } from '../middleware/auth.middleware';
import { 
  getContacts,
  addContact,
  addContactFromLeads,
  updateContact,
  deleteContact
} from '../controllers/contacts.controller';
import { validateBody } from '../middleware/validate';
import { addContactSchema, updateContactSchema } from '../schema/contacts.schema';


const router = Router();
router.use(authenticateUser);

router.get('/show-contacts', getContacts);
router.post('/add-contact', validateBody(addContactSchema), addContact);
router.post('/add-leadscontact', validateBody(addContactSchema),  addContactFromLeads);
router.patch('/update-contact/:id', validateBody(updateContactSchema), updateContact);
router.delete('/delete-contact/:id', deleteContact);

export default router;

 