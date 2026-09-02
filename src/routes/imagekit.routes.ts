import { Router } from "express";

import { verifyToken } from "../middleware/auth.middleware";
import { getImageKitAuth } from "../controllers/imagekit.controller";


const router = Router();


router.use(verifyToken);


router.get(
  "/auth",
  getImageKitAuth
);


export default router;