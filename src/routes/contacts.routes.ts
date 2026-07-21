import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';
import { 
  getContacts,
  addContact,
  addContactFromLeads,
  updateContact,
  deleteContact,
  deleteBulkContacts,
  updateContactSocials,
  updateContactCareer,
  getContactsLists
} from '../controllers/contacts.controller';
import { validateBody } from '../middleware/validate';
import { addContactSchema, updateCareerSchema, updateContactSchema, updateSocialsSchema } from '../schema/contacts.schema';


const router = Router();
router.use(verifyToken);
router.use(authenticateUser);

router.get('/show-contacts', getContacts);
router.get('/show-contacts-lists', getContactsLists);

router.post('/add-contact', validateBody(addContactSchema), addContact);
router.post('/move-contact', validateBody(addContactSchema),  addContactFromLeads);

router.patch('/update-contact/:id', validateBody(updateContactSchema), updateContact);
router.patch('/update-socials/:id', validateBody(updateSocialsSchema), updateContactSocials);
router.patch('/update-career/:id', validateBody(updateCareerSchema), updateContactCareer);

router.delete('/delete-contact/:id', deleteContact);
router.delete('/delete-contacts', deleteBulkContacts);

export default router;

 