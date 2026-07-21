import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';
import { adminSignIn, adminSignUp, agentSignIn, changePassword, getCurrentUser, refreshToken, signOut } from './../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { signUpSchema, signInSchema, changePasswordSchema } from '../schema/auth.schema';

const router = Router();

router.post('/signup',validateBody(signUpSchema), adminSignUp);
router.post('/admin-signin',validateBody(signInSchema), adminSignIn);
router.post('/agent-signin',validateBody(signInSchema), agentSignIn);
router.patch('/refresh', refreshToken);



router.use(verifyToken);
router.use(authenticateUser);
router.get('/me', getCurrentUser);

router.patch('/me/change-password',validateBody(changePasswordSchema),changePassword);


router.delete('/signout', signOut);


export default router;