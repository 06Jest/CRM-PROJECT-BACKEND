import { Router } from 'express';
import { authenticateUser, requireActiveMembership, verifyToken } from '../middleware/auth.middleware';
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
import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';


const router = Router();
router.use(verifyToken);
router.use(authenticateUser);


router.get('/show-contacts',readLimiter, getContacts);
router.get('/show-contacts-lists',readLimiter, getContactsLists);

router.use(requireActiveMembership);

router.post('/add-contact',createLimiter, validateBody(addContactSchema), addContact);
router.post('/move-contact',createLimiter, validateBody(addContactSchema),  addContactFromLeads);

router.patch('/update-contact/:id', updateLimiter, validateBody(updateContactSchema), updateContact);
router.patch('/update-socials/:id', updateLimiter, validateBody(updateSocialsSchema), updateContactSocials);
router.patch('/update-career/:id', updateLimiter, validateBody(updateCareerSchema), updateContactCareer);

router.delete('/delete-contact/:id',deleteLimiter, deleteContact);
router.delete('/delete-contacts',deleteLimiter, deleteBulkContacts);

export default router;

 