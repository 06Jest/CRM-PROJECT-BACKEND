import { Router } from 'express';
import { authenticateUser, verifyToken } from '../middleware/auth.middleware';
import { adminSignIn, adminSignUp, agentSignIn, changePassword, getCurrentUser, refreshToken, signOut } from './../controllers/auth.controller';
import { validateBody } from '../middleware/validate';
import { signUpSchema, signInSchema, changePasswordSchema } from '../schema/auth.schema';
import { loginLimiter, refreshLimiter } from '../middleware/rate.limit.middleware';

const router = Router();

router.post('/signup',loginLimiter ,validateBody(signUpSchema), adminSignUp);
router.post('/admin-signin',loginLimiter, validateBody(signInSchema), adminSignIn);
router.post('/agent-signin',loginLimiter, validateBody(signInSchema), agentSignIn);
router.patch('/refresh',refreshLimiter, refreshToken);



router.use(verifyToken);
router.use(authenticateUser);
router.get('/me',refreshLimiter,  getCurrentUser);

router.patch('/me/change-password',validateBody(changePasswordSchema),changePassword);


router.delete('/signout', signOut);


export default router;