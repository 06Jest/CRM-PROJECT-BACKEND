import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware';
import { adminSignIn, adminSignUp, agentSignIn, changePassword, signOut } from './../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { signUpSchema, signInSchema, changePasswordSchema } from '../schema/auth.schema';

const router = Router();

router.post('/orgadmin-signup',validateBody(signUpSchema), adminSignUp);
router.post('/orgadmin-signin',validateBody(signInSchema), adminSignIn);
router.post('/orgagent-signin',validateBody(signInSchema),  agentSignIn);

router.use(verifyToken);

router.patch('/change-password',validateBody(changePasswordSchema),changePassword);
router.delete('/signout', signOut);

export default router;