import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';

import { validateBody } from '../middleware/validate';
import { deleteBulkCustomers, deleteCustomer, getCustomers, getCustomersLists, updateCustomerNotes, updateCustomerStatus } from '../controllers/customers.controller';
import { updateCustomerNotesSchema, updateCustomerStatusSchema } from '../schema/customer.schema';



const router = Router();
router.use(verifyToken);
router.use(authenticateUser);

router.get('/show-customers', getCustomers);
router.get('/show-customers-lists', getCustomersLists);
router.patch('/update-customer-notes/:id', validateBody(updateCustomerNotesSchema), updateCustomerNotes);
router.patch('/update-customer-status/:id', validateBody(updateCustomerStatusSchema), updateCustomerStatus);
router.delete('/delete-customer/:id', deleteCustomer);
router.delete('/delete-customers', deleteBulkCustomers);

export default router;

 