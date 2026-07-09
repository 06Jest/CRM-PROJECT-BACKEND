import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';
import { adminSignIn, adminSignUp, agentSignIn, changePassword, getCurrentUser, refreshToken, signOut } from './../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { signUpSchema, signInSchema, changePasswordSchema } from '../schema/auth.schema';

const router = Router();

router.post('/orgadmin-signup',validateBody(signUpSchema), adminSignUp);
router.post('/orgadmin-signin',validateBody(signInSchema), adminSignIn);
router.post('/orgagent-signin',validateBody(signInSchema),  agentSignIn);



router.use(verifyToken);
router.use(authenticateUser);

router.post('/me', getCurrentUser);
router.patch('/me/change-password',validateBody(changePasswordSchema),changePassword);
router.patch('/me/refresh/', refreshToken);

router.delete('/signout', signOut);


export default router;