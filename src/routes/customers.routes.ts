import { Router } from 'express';
import { authenticateUser, requireActiveMembership, verifyToken } from '../middleware/auth.middleware';

import { validateBody } from '../middleware/validate';
import { deleteBulkCustomers, deleteCustomer, getCustomerListByID, getCustomers, getCustomersLists, updateCustomerNotes, updateCustomerStatus } from '../controllers/customers.controller';
import { updateCustomerNotesSchema, updateCustomerStatusSchema } from '../schema/customer.schema';
import { deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';


const router = Router();
router.use(verifyToken);
router.use(authenticateUser);


router.get(
  '/show',
  readLimiter, 
  getCustomers
);

router.get(
  '/show-lists',
  readLimiter, 
  getCustomersLists
);

router.get(
  '/view-list/:id',
  readLimiter, 
  getCustomerListByID
);

router.use(requireActiveMembership);

router.patch(
  '/update/notes/:id', 
  updateLimiter, 
  validateBody(updateCustomerNotesSchema), 
  updateCustomerNotes
);

router.patch(
  '/update/status/:id', 
  updateLimiter , 
  validateBody(updateCustomerStatusSchema), 
  updateCustomerStatus
);

router.delete(
  '/delete/:id',
  deleteLimiter, 
  deleteCustomer
);

router.delete(
  '/delete',
  deleteLimiter, 
  deleteBulkCustomers
);

export default router;

 