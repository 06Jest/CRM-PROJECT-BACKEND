import { Router } from 'express';
import { verifyToken } from '../middleware/auth.middleware'; 
import {
  dashboardSummary, contactIntel,
  dealPredict, composeMessage, chatWithAssistant,
} from '../controllers/ai.controller';

 const router = Router();

 router.use(verifyToken);

 router.post('/dashboard-summary', dashboardSummary);
 router.post('/contact-intel', contactIntel);
 router.post('/deal-predict', dealPredict);
 router.post('/compose', composeMessage);
 router.post('/chat', chatWithAssistant);

 export default router;