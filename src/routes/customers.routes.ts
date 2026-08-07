import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';

import { validateBody } from '../middleware/validate';
import { deleteBulkCustomers, deleteCustomer, getCustomers, getCustomersLists, updateCustomerNotes, updateCustomerStatus } from '../controllers/customers.controller';
import { updateCustomerNotesSchema, updateCustomerStatusSchema } from '../schema/customer.schema';
import { deleteLimiter, readLimiter, updateLimiter } from '../middleware/rate.limit.middleware';


const router = Router();
router.use(verifyToken);
router.use(authenticateUser);

router.get('/show-customers',readLimiter, getCustomers);
router.get('/show-customers-lists',readLimiter, getCustomersLists);

router.patch('/update-customer-notes/:id', updateLimiter , validateBody(updateCustomerNotesSchema), updateCustomerNotes);
router.patch('/update-customer-status/:id', updateLimiter , validateBody(updateCustomerStatusSchema), updateCustomerStatus);

router.delete('/delete-customer/:id',deleteLimiter, deleteCustomer);
router.delete('/delete-customers',deleteLimiter, deleteBulkCustomers);

export default router;

 