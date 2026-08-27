import { Router } from 'express';
import { authenticateUser, requireActiveMembership, verifyToken } from '../middleware/auth.middleware';
import { 
  getContacts,
  addContact,
  addContactFromLeads,
  deleteContact,
  deleteBulkContacts,
  updateContactSocials,
  updateContactCareer,
  getContactsLists,
  updateContactNotes,
  updateContactSource,
  updateContactPriority,
  updateContactPreferredTime,
  updateContactPersonal,
  getContactListByID
} from '../controllers/contacts.controller';
import { validateBody } from '../middleware/validate';
import { addContactSchema, updateCareerSchema, updateContactNotesSchema, updateContactPreferredTimeSchema, updateContactPrioritySchema, updateContactSchema, updateContactSourceSchema, updateSocialsSchema } from '../schema/contacts.schema';
import { createLimiter, deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';


const router = Router();
router.use(verifyToken);
router.use(authenticateUser);


router.get(
  '/show',
  readLimiter, 
  getContacts
);

router.get(
  '/show-lists',
  readLimiter, 
  getContactsLists
);

router.get(
  '/view-list/:id',
  readLimiter, 
  getContactListByID
);


router.use(requireActiveMembership);

router.post(
  '/add',
  createLimiter, 
  validateBody(addContactSchema), 
  addContact
);

router.post(
  '/move',
  createLimiter, 
  validateBody(addContactSchema),  
  addContactFromLeads
);

router.patch(
  '/update/personal/:id', 
  updateLimiter, 
  validateBody(updateContactSchema), 
  updateContactPersonal
);

router.patch(
  '/update/socials/:id', 
  updateLimiter, 
  validateBody(updateSocialsSchema), 
  updateContactSocials
);

router.patch(
  '/update/career/:id', 
  updateLimiter, 
  validateBody(updateCareerSchema), 
  updateContactCareer
);

router.patch(
  '/update/notes/:id',
  updateLimiter,
  validateBody(updateContactNotesSchema),
  updateContactNotes
);

router.patch(
  '/update/source/:id',
  updateLimiter,
  validateBody(updateContactSourceSchema),
  updateContactSource
);

router.patch(
  '/update/priority/:id',
  updateLimiter,
  validateBody(updateContactPrioritySchema),
  updateContactPriority
);

router.patch(
  '/update/preferred-time/:id',
  updateLimiter,
  validateBody(updateContactPreferredTimeSchema),
  updateContactPreferredTime
);


router.delete(
  '/delete/:id',
  deleteLimiter, 
  deleteContact
);

router.delete(
  '/delete/bulk',
  deleteLimiter, 
  deleteBulkContacts
);

export default router;

 